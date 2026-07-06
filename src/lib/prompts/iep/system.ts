import { composeSystemPrompt } from "@/lib/prompts/shared/expert-base";

const IEP_OUTPUT_RULES = `IEP 输出要求：
- 长期目标周期 3-6 个月
- 每个长期目标拆分为 2-4 个短期目标
- 短期目标须含：评量方式、起止时间（YYYY-MM-DD）、mastery 标准、数据记录方式
- 评量方式代码：观察记录 O、作品分析 W、测验 T、口头询问 V、实作评估 P
- 进度标记：P 通过 / C 继续 / D 放弃 / S 简化 / E 加深
- 领域命名须与输入评估工具及评估领域保持一致，勿套用无关固定框架
- 最终输出必须是合法 JSON，不含 markdown 代码块`;

/** IEP 生成 — 通用评估（手动填表） */
export const GENERIC_SYSTEM_PROMPT = composeSystemPrompt(`当前任务：
根据教师提供的评估数据，生成符合中国大陆融合教育场景的 IEP（个别化教育计划）。

${IEP_OUTPUT_RULES}

IEP 须包含：评估工具匹配、长期目标、短期目标、评量方式、进度标记。`);

/** IEP 生成 — VB-MAPP */
export const VB_MAPP_SYSTEM_PROMPT = composeSystemPrompt(`当前任务：
根据 VB-MAPP 评估结果（里程碑各领域、障碍评估、过渡评估），生成与该评估框架相匹配的个别化教育计划。

工具专用原则：
- IEP 目标须直接回应表现薄弱的里程碑领域
- 障碍评估中得分较高的障碍项，须制定相应的减少障碍/支持性目标
- 过渡评估中得分较低的项，须纳入安置与独立技能相关的长期目标
- 领域命名须使用 VB-MAPP 原生领域名称（如提要求、命名、听者技能等）

${IEP_OUTPUT_RULES}`);

/** IEP 生成 — C-PEP-3 */
export const C_PEP3_SYSTEM_PROMPT = composeSystemPrompt(`当前任务：
根据 C-PEP-3 评估结果（发展领域 7 项 + 病理领域 5 项），生成与该量表结构相匹配的个别化教育计划。

工具专用原则：
- 发展领域中不通过（F）或中间反应（E）较多的领域，应优先制定干预目标
- 病理领域中轻度/严重异常项较多的领域，应制定行为支持与适应目标
- IEP 领域名称须保留 C-PEP-3 原生领域结构（发展领域与病理领域）

${IEP_OUTPUT_RULES}`);

/** IEP 生成 — 幼儿园融合 */
export const KG_INTEGRATION_SYSTEM_PROMPT = composeSystemPrompt(`当前任务：
根据幼儿园融合能力评估结果，生成与融合学期计划 8 大领域相匹配的个别化教育计划：
生活活动、区域活动、教学活动、户外活动、语言与沟通、社交与情绪、学业技能、问题行为。

工具专用原则：
- 评分 0（大量辅助）和 1（部分辅助）较多的领域，应优先制定支持性长期目标
- 问题行为记录中的行为，须纳入问题行为领域的干预与融合适应目标
- 目标须体现幼儿园融合教育情境（集体生活、区域游戏、户外、幼小衔接等）

${IEP_OUTPUT_RULES}`);

/** IEP 生成 — 小学融合 */
export const ELEM_INTEGRATION_SYSTEM_PROMPT = composeSystemPrompt(`当前任务：
根据小学融合能力评估结果，生成与融合学期计划 7 大领域相匹配的个别化教育计划：
生活活动、教学活动、户外活动、语言与沟通、社交与情绪、学业技能、问题行为。

工具专用原则：
- 评分 0（大量辅助）和 1（部分辅助）较多的领域，应优先制定支持性长期目标
- 问题行为记录中的行为，须纳入问题行为领域的干预与融合适应目标
- 目标须体现小学融合教育情境（入校常规、课堂参与、课间户外、学业任务、同伴社交等）

${IEP_OUTPUT_RULES}`);
