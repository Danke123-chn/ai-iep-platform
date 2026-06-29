import type {
  AssessmentData,
  DeepSeekChatMessage,
  DeepSeekChatResponse,
  GeneratedIEP,
  IEPDomain,
  IepDomainMode,
  TokenUsage,
} from "@/types/iep";
import { DeepSeekError } from "@/types/iep";

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

const GENERIC_SYSTEM_PROMPT = `你是中国特殊教育领域的IEP（个别化教育计划）专家，拥有以下专业背景：
- 精通中国《特殊教育提升计划》相关政策
- 熟悉VB-MAPP、PEP-3等评估工具
- 了解中国义务教育阶段特教班的运作模式
- 擅长为孤独症、智力障碍、学习困难等类型学生制定IEP

你的任务是：根据教师提供的评估数据，生成符合中国学校要求的IEP文档。

IEP必须包含以下结构：
1. 匹配相应的评估工具
2. 长期目标（3-6个月的目标）
3. 短期目标（每个长期目标拆为3-5个可操作的短期目标）
4. 评量方式（观察记录O、作品分析W、测验T、口头询问V、实作评估P）
5. 进度标记（P通过/C继续/D放弃/S简化/E加深）

关键原则：
- 目标必须具体、可测量、有时限（SMART原则）
- 短期目标必须是从长期目标拆解而来的阶梯式步骤
- 评量方式要与目标内容匹配（使用 O/W/T/V/P 代码）
- 目标难度要基于评估等级，不可过高或过低
- IEP 领域命名与目标结构须与输入的评估工具及评估领域保持一致，勿套用与评估无关的固定领域框架
- 使用中国特教领域的专业术语和表达习惯

输出格式：严格的JSON结构，不要包含任何JSON以外的内容。`;

const VB_MAPP_SYSTEM_PROMPT = `你是一位资深的中国特殊教育 IEP 专家，精通 VB-MAPP（语言行为里程碑评估与安置计划）及 ABA 干预实践。

你的任务是根据 VB-MAPP 评估结果（里程碑各领域、障碍评估、过渡评估），生成与该评估框架相匹配的个别化教育计划。

撰写原则：
- IEP 目标须直接回应 VB-MAPP 评估中表现薄弱的里程碑领域
- 对障碍评估中得分较高的障碍项，须制定相应的减少障碍/支持性目标
- 过渡评估中得分较低的项，须纳入安置与独立技能相关的长期目标
- 领域命名须使用 VB-MAPP 原生领域名称（如提要求、命名、听者技能、障碍评估、过渡评估等）
- 长期目标应具体、可测量；每个长期目标拆分为 3-5 个短期目标
- 短期目标需包含评量方式与起止时间（YYYY-MM-DD）
- 最终输出必须是合法 JSON，不含 markdown 代码块`;

const C_PEP3_SYSTEM_PROMPT = `你是一位资深的中国特殊教育 IEP 专家，精通 C-PEP-3（中国版心理教育量表第三版）的解读与 IEP 制定。

你的任务是根据 C-PEP-3 评估结果（发展领域 7 项 + 病理领域 5 项），生成与该量表结构相匹配的个别化教育计划。

撰写原则：
- 发展领域中不通过（F）或中间反应（E）较多的领域，应优先制定干预目标
- 病理领域中轻度/严重异常项较多的领域，应制定行为支持与适应目标
- IEP 领域名称须保留 C-PEP-3 原生领域结构（发展领域与病理领域）
- 每个长期目标拆分为 3-5 个短期目标，含评量方式与起止时间（YYYY-MM-DD）
- 最终输出必须是合法 JSON，不含 markdown 代码块`;

const KG_INTEGRATION_SYSTEM_PROMPT = `你是一位资深的中国融合教育 IEP 专家，精通幼儿园融合能力评估（入园）及融合学期计划制定。

你的任务是根据幼儿园融合能力评估结果，生成与融合学期计划 8 大领域相匹配的个别化教育计划：
生活活动、区域活动、教学活动、户外活动、语言与沟通、社交与情绪、学业技能、问题行为。

撰写原则：
- 评分 0（大量辅助）和 1（部分辅助）较多的领域，应优先制定支持性长期目标
- 问题行为记录中的行为，须纳入问题行为领域的干预与融合适应目标
- 目标须体现幼儿园融合教育情境（集体生活、区域游戏、户外、幼小衔接等）
- 每个长期目标拆分为 3-5 个短期目标，含评量方式与起止时间（YYYY-MM-DD）
- 最终输出必须是合法 JSON，不含 markdown 代码块`;

const ELEM_INTEGRATION_SYSTEM_PROMPT = `你是一位资深的中国融合教育 IEP 专家，精通小学融合能力评估（入校）及融合学期计划制定。

你的任务是根据小学融合能力评估结果，生成与融合学期计划 7 大领域相匹配的个别化教育计划：
生活活动、教学活动、户外活动、语言与沟通、社交与情绪、学业技能、问题行为。

撰写原则：
- 评分 0（大量辅助）和 1（部分辅助）较多的领域，应优先制定支持性长期目标
- 问题行为记录中的行为，须纳入问题行为领域的干预与融合适应目标
- 目标须体现小学融合教育情境（入校常规、课堂参与、课间户外、学业任务、同伴社交等）
- 每个长期目标拆分为 3-5 个短期目标，含评量方式与起止时间（YYYY-MM-DD）
- 最终输出必须是合法 JSON，不含 markdown 代码块`;

function getSystemPrompt(mode: IepDomainMode = "generic"): string {
  switch (mode) {
    case "vb_mapp":
      return VB_MAPP_SYSTEM_PROMPT;
    case "c_pep3":
      return C_PEP3_SYSTEM_PROMPT;
    case "kg_integration":
      return KG_INTEGRATION_SYSTEM_PROMPT;
    case "elem_integration":
      return ELEM_INTEGRATION_SYSTEM_PROMPT;
    default:
      return GENERIC_SYSTEM_PROMPT;
  }
}

function getAssessmentIntro(mode: IepDomainMode): string {
  switch (mode) {
    case "vb_mapp":
      return "以下为学生 VB-MAPP 评估数据（含里程碑各领域、障碍评估、过渡评估）：";
    case "c_pep3":
      return "以下为学生 C-PEP-3 评估数据（含发展领域与病理领域）：";
    case "kg_integration":
      return "以下为学生幼儿园融合能力评估数据（含融合活动、融合技能及问题行为记录）：";
    case "elem_integration":
      return "以下为学生小学融合能力评估数据（含融合活动、融合技能及问题行为记录）：";
    default:
      return "以下为学生评估数据（含基本信息与各评估领域）：";
  }
}

function getGenerationSteps(
  mode: IepDomainMode,
  assessDate?: string,
): { step1: string; step2: string; step3: string; step4: string } {
  const dateHint = assessDate ?? "本学期开始";

  if (mode === "vb_mapp") {
    return {
      step1:
        "Step 1：请综合分析上述 VB-MAPP 里程碑各领域、障碍评估与过渡评估数据，归纳各领域的现状等级（1-5 级或优/良/中/待加强），并说明依据。",
      step2:
        "Step 2：针对评估中需重点支持的里程碑领域、显著障碍项及过渡薄弱项，分别为每个相关领域制定 1 条具体、可测量的长期目标（领域数量通常为 6-12 个，覆盖主要薄弱点）。",
      step3:
        "Step 3：请将 Step 2 中每个长期目标拆分为 3-5 个短期目标，短期目标应具体、可操作、可评量，并体现 VB-MAPP/ABA 干预思路。",
      step4: `Step 4：请为每个短期目标匹配评量方式和时间安排，并输出最终结构化 JSON。

要求：
- 只输出 JSON，不要 markdown 代码块
- 结构如下：
{
  "domains": [
    {
      "name": "领域名称（使用 VB-MAPP 原生领域名）",
      "currentLevel": "现状等级描述",
      "longTermGoal": "长期目标",
      "shortTermGoals": [
        {
          "content": "短期目标内容",
          "assessmentMethod": "评量方式",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖评估中的主要薄弱领域，数量通常为 6-12 个
- 每个领域的 shortTermGoals 数量为 3-5 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末`,
    };
  }

  if (mode === "c_pep3") {
    return {
      step1:
        "Step 1：请综合分析上述 C-PEP-3 发展领域与病理领域数据，归纳各领域的现状等级（1-5 级或优/良/中/待加强），并说明依据。",
      step2:
        "Step 2：针对发展领域薄弱项及病理领域异常项，分别为每个需干预的领域制定 1 条具体、可测量的长期目标（领域数量通常为 8-12 个，保留 C-PEP-3 原生领域名称）。",
      step3:
        "Step 3：请将 Step 2 中每个长期目标拆分为 3-5 个短期目标，短期目标应具体、可操作、可评量。",
      step4: `Step 4：请为每个短期目标匹配评量方式和时间安排，并输出最终结构化 JSON。

要求：
- 只输出 JSON，不要 markdown 代码块
- 结构如下：
{
  "domains": [
    {
      "name": "领域名称（使用 C-PEP-3 原生领域名，如「模仿（发展）」）",
      "currentLevel": "现状等级描述",
      "longTermGoal": "长期目标",
      "shortTermGoals": [
        {
          "content": "短期目标内容",
          "assessmentMethod": "评量方式",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖需干预的发展与病理领域，数量通常为 8-12 个
- 每个领域的 shortTermGoals 数量为 3-5 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末`,
    };
  }

  if (mode === "kg_integration") {
    return {
      step1:
        "Step 1：请综合分析上述幼儿园融合能力评估数据（融合活动、融合技能及问题行为），归纳各领域的现状等级（1-5 级或优/良/中/待加强），并说明依据。",
      step2:
        "Step 2：针对 0 分/1 分较多的融合领域及问题行为记录，分别为每个需支持的领域制定 1 条具体、可测量的长期目标（领域须使用：生活活动、区域活动、教学活动、户外活动、语言与沟通、社交与情绪、学业技能、问题行为）。",
      step3:
        "Step 3：请将 Step 2 中每个长期目标拆分为 3-5 个短期目标，短期目标应具体、可操作、可评量，体现幼儿园融合教育情境。",
      step4: `Step 4：请为每个短期目标匹配评量方式和时间安排，并输出最终结构化 JSON。

要求：
- 只输出 JSON，不要 markdown 代码块
- 结构如下：
{
  "domains": [
    {
      "name": "领域名称（使用融合学期计划原生领域名）",
      "currentLevel": "现状等级描述",
      "longTermGoal": "长期目标",
      "shortTermGoals": [
        {
          "content": "短期目标内容",
          "assessmentMethod": "评量方式",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖需支持的融合领域，数量通常为 6-8 个
- 每个领域的 shortTermGoals 数量为 3-5 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末`,
    };
  }

  if (mode === "elem_integration") {
    return {
      step1:
        "Step 1：请综合分析上述小学融合能力评估数据（融合活动、融合技能及问题行为），归纳各领域的现状等级（1-5 级或优/良/中/待加强），并说明依据。",
      step2:
        "Step 2：针对 0 分/1 分较多的融合领域及问题行为记录，分别为每个需支持的领域制定 1 条具体、可测量的长期目标（领域须使用：生活活动、教学活动、户外活动、语言与沟通、社交与情绪、学业技能、问题行为）。",
      step3:
        "Step 3：请将 Step 2 中每个长期目标拆分为 3-5 个短期目标，短期目标应具体、可操作、可评量，体现小学融合教育情境。",
      step4: `Step 4：请为每个短期目标匹配评量方式和时间安排，并输出最终结构化 JSON。

要求：
- 只输出 JSON，不要 markdown 代码块
- 结构如下：
{
  "domains": [
    {
      "name": "领域名称（使用小学融合学期计划原生领域名）",
      "currentLevel": "现状等级描述",
      "longTermGoal": "长期目标",
      "shortTermGoals": [
        {
          "content": "短期目标内容",
          "assessmentMethod": "评量方式",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖需支持的融合领域，数量通常为 6-7 个
- 每个领域的 shortTermGoals 数量为 3-5 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末`,
    };
  }

  return {
    step1:
      "Step 1：请综合分析上述评估数据中各领域的等级与描述，归纳每个评估领域的现状水平（1-5 级或优/良/中/待加强），并说明依据。",
    step2:
      "Step 2：针对评估数据中的每个领域，依据其评估等级制定 1 条具体、可测量的长期目标；领域名称须与评估数据中的领域名称一致。",
    step3:
      "Step 3：请将 Step 2 中每个长期目标拆分为 3-5 个短期目标，短期目标应具体、可操作、可评量，形成阶梯式步骤。",
    step4: `Step 4：请为每个短期目标匹配评量方式（使用 O/W/T/V/P 代码）和时间安排，并输出最终结构化 JSON。

要求：
- 只输出 JSON，不要 markdown 代码块
- 结构如下：
{
  "domains": [
    {
      "name": "领域名称（与评估数据中的领域名称一致）",
      "currentLevel": "现状等级描述",
      "longTermGoal": "长期目标",
      "shortTermGoals": [
        {
          "content": "短期目标内容",
          "assessmentMethod": "评量方式（O/W/T/V/P）",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "progress": "C"
        }
      ]
    }
  ]
}
- domains 须与评估数据中的领域一一对应，数量与评估领域相同
- 每个领域的 shortTermGoals 数量为 3-5 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末（长期目标周期 3-6 个月）`,
  };
}

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
    { role: "system", content: getSystemPrompt(mode) },
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
