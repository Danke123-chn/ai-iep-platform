import type { IepExportData, ProgressReportContent } from "@/lib/iep-export/types";
import { computeProgressStats, getShortTermGoalProgress } from "@/lib/iep-progress";
import {
  buildProgressReportUserPrompt,
  PROGRESS_REPORT_SYSTEM_PROMPT,
} from "@/lib/prompts/progress/report";
import { DeepSeekError } from "@/types/iep";
import { GOAL_PROGRESS_LABELS } from "@/types/iep";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-chat";

export async function generateProgressReportContent(
  data: IepExportData,
): Promise<ProgressReportContent> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new DeepSeekError("DEEPSEEK_API_KEY 未配置");
  }

  const stats = computeProgressStats(data.goals);
  const goalSummary = data.goals
    .map((goal) => {
      const stgLines = goal.short_term_goals
        .map((stg) => {
          const p = getShortTermGoalProgress(stg);
          return `- ${stg.content} [${p ? GOAL_PROGRESS_LABELS[p] : "未更新"}]`;
        })
        .join("\n");
      return `【${goal.domain_name}】现状：${goal.current_level}\n长期目标：${goal.long_term_goal}\n${stgLines}`;
    })
    .join("\n\n");

  const prompt = buildProgressReportUserPrompt({
    studentName: data.student?.name ?? "未知",
    schoolYear: data.iep.school_year,
    semester: data.iep.semester,
    startDate: data.iep.start_date,
    endDate: data.iep.end_date,
    statsLine: `总目标${stats.total}项，通过(P)${stats.P}，继续(C)${stats.C}，放弃(D)${stats.D}，简化(S)${stats.S}，加深(E)${stats.E}`,
    goalSummary,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content: PROGRESS_REPORT_SYSTEM_PROMPT,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      if (response.status === 402 || errorBody.includes("Insufficient Balance")) {
        throw new DeepSeekError(
          "DeepSeek 账户余额不足。请登录 https://platform.deepseek.com 充值后再试。",
          402,
        );
      }
      throw new DeepSeekError(`AI 报告生成失败 (${response.status})`, response.status);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content) as ProgressReportContent;

    return {
      overview: parsed.overview ?? "本报告总结了当前 IEP 执行阶段的总体进展。",
      domainSummaries: parsed.domainSummaries ?? [],
      teachingSuggestions: parsed.teachingSuggestions ?? [],
      nextPhaseAdjustments: parsed.nextPhaseAdjustments ?? [],
    };
  } catch (err) {
    if (err instanceof DeepSeekError) throw err;
    throw new DeepSeekError(
      err instanceof Error ? err.message : "AI 报告生成失败",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
