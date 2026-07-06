import type { IepDomainMode } from "@/types/iep";

export function getAssessmentIntro(mode: IepDomainMode): string {
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

export function getGenerationSteps(
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
        "Step 3：请将 Step 2 中每个长期目标拆分为 2-4 个短期目标，短期目标应具体、可操作、可评量，并体现 VB-MAPP/ABA 干预思路。",
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
          "assessmentMethod": "评量方式（含 O/W/T/V/P 代码、mastery 标准、数据记录方式）",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖评估中的主要薄弱领域，数量通常为 6-12 个
- 每个领域的 shortTermGoals 数量为 2-4 个
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
        "Step 3：请将 Step 2 中每个长期目标拆分为 2-4 个短期目标，短期目标应具体、可操作、可评量。",
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
          "assessmentMethod": "评量方式（含 O/W/T/V/P 代码、mastery 标准、数据记录方式）",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖需干预的发展与病理领域，数量通常为 8-12 个
- 每个领域的 shortTermGoals 数量为 2-4 个
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
        "Step 3：请将 Step 2 中每个长期目标拆分为 2-4 个短期目标，短期目标应具体、可操作、可评量，体现幼儿园融合教育情境。",
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
          "assessmentMethod": "评量方式（含 O/W/T/V/P 代码、mastery 标准、数据记录方式）",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖需支持的融合领域，数量通常为 6-8 个
- 每个领域的 shortTermGoals 数量为 2-4 个
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
        "Step 3：请将 Step 2 中每个长期目标拆分为 2-4 个短期目标，短期目标应具体、可操作、可评量，体现小学融合教育情境。",
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
          "assessmentMethod": "评量方式（含 O/W/T/V/P 代码、mastery 标准、数据记录方式）",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
- domains 应覆盖需支持的融合领域，数量通常为 6-7 个
- 每个领域的 shortTermGoals 数量为 2-4 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末`,
    };
  }

  return {
    step1:
      "Step 1：请综合分析上述评估数据中各领域的等级与描述，归纳每个评估领域的现状水平（1-5 级或优/良/中/待加强），并说明依据。",
    step2:
      "Step 2：针对评估数据中的每个领域，依据其评估等级制定 1 条具体、可测量的长期目标；领域名称须与评估数据中的领域名称一致。",
    step3:
      "Step 3：请将 Step 2 中每个长期目标拆分为 2-4 个短期目标，短期目标应具体、可操作、可评量，形成阶梯式步骤。",
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
          "assessmentMethod": "评量方式（O/W/T/V/P，含 mastery 标准与数据记录方式）",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "progress": "C"
        }
      ]
    }
  ]
}
- domains 须与评估数据中的领域一一对应，数量与评估领域相同
- 每个领域的 shortTermGoals 数量为 2-4 个
- startDate 建议从 ${dateHint} 起算，endDate 为本学期或学年末（长期目标周期 3-6 个月）`,
  };
}
