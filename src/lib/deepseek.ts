import type {
  AssessmentData,
  DeepSeekChatMessage,
  DeepSeekChatResponse,
  GeneratedIEP,
  IEPDomain,
  TokenUsage,
} from "@/types/iep";
import { DeepSeekError } from "@/types/iep";
import {
  getAssessmentIntro,
  getGenerationSteps,
  getIepSystemPrompt,
} from "@/lib/prompts/iep";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-chat";
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
/** IEP 分步生成每步超时（VB-MAPP / C-PEP-3 领域多、输出大） */
const IEP_STEP_TIMEOUT_MS = 120_000;
const IEP_JSON_STEP_TIMEOUT_MS = 180_000;
const MAX_RETRIES = 1;

/** 单次完整 IEP 生成的 token 预估值 */
export const ESTIMATED_INPUT_TOKENS = 2000;
export const ESTIMATED_OUTPUT_TOKENS = 3000;

function getApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new DeepSeekError(
      "DEEPSEEK_API_KEY 未配置，请在 .env.local 中设置后重启服务。",
    );
  }
  return apiKey;
}

export function createDeepSeekClient() {
  const apiKey = getApiKey();

  return {
    apiKey,
    baseUrl: DEEPSEEK_BASE_URL,
    model: DEEPSEEK_MODEL,
  };
}

function parseDeepSeekApiError(status: number, errorBody: string): string {
  if (status === 402 || errorBody.includes("Insufficient Balance")) {
    return "DeepSeek 账户余额不足。请登录 https://platform.deepseek.com 充值后再试。";
  }
  if (status === 401 || errorBody.includes("Authentication")) {
    return "DeepSeek API Key 无效。请检查 .env.local 中的 DEEPSEEK_API_KEY 是否正确。";
  }
  if (status === 429) {
    return "DeepSeek 请求过于频繁，请稍后再试。";
  }
  return `DeepSeek API 请求失败 (${status})${errorBody ? `: ${errorBody.slice(0, 200)}` : ""}`;
}

export async function chatCompletion(
  messages: DeepSeekChatMessage[],
  options?: { jsonMode?: boolean; timeoutMs?: number },
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const client = createDeepSeekClient();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${client.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${client.apiKey}`,
      },
      body: JSON.stringify({
        model: client.model,
        messages,
        temperature: 0.4,
        ...(options?.jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new DeepSeekError(
        parseDeepSeekApiError(response.status, errorBody),
        response.status,
      );
    }

    const data = (await response.json()) as DeepSeekChatResponse;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new DeepSeekError("DeepSeek API 返回内容为空");
    }

    return {
      content,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    };
  } catch (err) {
    if (err instanceof DeepSeekError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new DeepSeekError(`DeepSeek API 请求超时（${timeoutMs / 1000} 秒）`);
    }
    throw new DeepSeekError(
      err instanceof Error ? err.message : "DeepSeek API 未知错误",
      undefined,
      err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function chatWithRetry(
  messages: DeepSeekChatMessage[],
  options?: { jsonMode?: boolean; timeoutMs?: number },
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await chatCompletion(messages, options);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) continue;
    }
  }

  if (lastError instanceof DeepSeekError) throw lastError;
  throw new DeepSeekError(
    lastError instanceof Error ? lastError.message : "DeepSeek API 重试后仍失败",
    undefined,
    lastError,
  );
}

function buildAssessmentSummary(data: AssessmentData): string {
  return JSON.stringify(data, null, 2);
}

function parseGeneratedIEP(content: string): IEPDomain[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new DeepSeekError("DeepSeek 返回的内容不是合法 JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("domains" in parsed) ||
    !Array.isArray((parsed as GeneratedIEP).domains)
  ) {
    throw new DeepSeekError("DeepSeek 返回的 JSON 缺少 domains 数组");
  }

  const domains = (parsed as GeneratedIEP).domains;

  for (const domain of domains) {
    if (
      !domain.name ||
      !domain.currentLevel ||
      !domain.longTermGoal ||
      !Array.isArray(domain.shortTermGoals)
    ) {
      throw new DeepSeekError(`领域「${domain.name ?? "未知"}」数据结构不完整`);
    }

    for (const goal of domain.shortTermGoals) {
      if (
        !goal.content ||
        !goal.assessmentMethod ||
        !goal.startDate ||
        !goal.endDate
      ) {
        throw new DeepSeekError(
          `领域「${domain.name}」的短期目标缺少必填字段`,
        );
      }
    }
  }

  return domains;
}

/**
 * 根据评估数据，通过多轮对话分步生成 IEP 结构化内容。
 */
export async function generateIEP(
  assessmentData: AssessmentData,
): Promise<GeneratedIEP> {
  const mode = assessmentData.domainMode ?? "generic";
  const steps = getGenerationSteps(mode, assessmentData.assessDate);

  const messages: DeepSeekChatMessage[] = [
    { role: "system", content: getIepSystemPrompt(mode) },
    {
      role: "user",
      content: `${getAssessmentIntro(mode)}\n${buildAssessmentSummary(assessmentData)}\n\n请按步骤协助我生成 IEP。`,
    },
  ];

  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  async function runStep(
    userPrompt: string,
    jsonMode = false,
    timeoutMs = IEP_STEP_TIMEOUT_MS,
  ) {
    messages.push({ role: "user", content: userPrompt });
    const result = await chatWithRetry(messages, { jsonMode, timeoutMs });
    messages.push({ role: "assistant", content: result.content });
    totalPromptTokens += result.promptTokens;
    totalCompletionTokens += result.completionTokens;
    return result.content;
  }

  await runStep(steps.step1);
  await runStep(steps.step2);
  await runStep(steps.step3);

  const finalContent = await runStep(steps.step4, true, IEP_JSON_STEP_TIMEOUT_MS);

  const domains = parseGeneratedIEP(finalContent);

  const tokenUsage: TokenUsage = {
    estimatedInputTokens: ESTIMATED_INPUT_TOKENS,
    estimatedOutputTokens: ESTIMATED_OUTPUT_TOKENS,
    actualInputTokens: totalPromptTokens,
    actualOutputTokens: totalCompletionTokens,
  };

  return {
    domains,
    tokenUsage,
    generatedAt: new Date().toISOString(),
  };
}

export { DeepSeekError };
