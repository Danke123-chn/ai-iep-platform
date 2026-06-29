import type { IepExportData } from "@/lib/iep-export/types";
import { formatPlacementTypes } from "@/lib/types/student";
import { computeProgressStats } from "@/lib/iep-progress";
import type { IepGenerateRequest } from "@/types/iep";

function getAssessmentResultLabel(data: IepExportData): string {
  const assessment = data.iep.assessment_data as Partial<IepGenerateRequest> | null;
  const mode = assessment?.domainMode;

  if (mode === "vb_mapp") {
    return "VB-MAPP 评估结果（里程碑、障碍与过渡）";
  }
  if (mode === "c_pep3") {
    return "C-PEP-3 评估结果（发展领域与病理领域）";
  }
  if (mode === "kg_integration") {
    return "幼儿园融合能力评估结果（融合活动、融合技能与问题行为）";
  }
  if (mode === "elem_integration") {
    return "小学融合能力评估结果（融合活动、融合技能与问题行为）";
  }

  const domainNames = assessment?.domains?.map((d) => d.name).filter(Boolean);
  if (domainNames && domainNames.length > 0) {
    return `评估结果（${domainNames.join("、")}）`;
  }

  return "评估结果";
}

export function buildTeachingSuggestions(data: IepExportData): string[] {
  const stats = computeProgressStats(data.goals);
  const studentName = data.student?.name ?? "该生";
  const placement = data.student
    ? formatPlacementTypes(data.student.placement_types)
    : "特教环境";
  const placementText = placement === "未填写" ? "特教环境" : placement;
  const assessmentLabel = getAssessmentResultLabel(data);

  const suggestions = [
    `${studentName}建议在${data.iep.semester}（${data.iep.start_date}至${data.iep.end_date}）采用个别化、小步骤、多感官参与的教学策略，安置于${placementText}。`,
    `依据${assessmentLabel}，应优先在表现较好的领域建立成功经验，在薄弱领域采用分解教学、提示消退与情境泛化策略。`,
    `本计划共设定${stats.total}项短期目标，已通过${stats.P}项、继续中${stats.C}项。对已通过目标应安排巩固与维持训练，对继续中目标应加强日常化练习与记录。`,
    `评量方式应与 IEP 目标保持一致，建议采用观察记录（O）、作品分析（W）、测验（T）等多种方式，每两周进行一次阶段性小结。`,
    `加强家校沟通，将 IEP 目标融入家庭日常生活场景，鼓励家长参与目标实施与反馈。`,
  ];

  if (stats.D > 0) {
    suggestions.push(
      `尚有${stats.D}项目标未开始，建议分析原因（如环境限制、前置技能不足），必要时调整目标难度或起始日期。`,
    );
  }

  return suggestions;
}
