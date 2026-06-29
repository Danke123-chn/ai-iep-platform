/** 六大评估领域（手动新建 IEP 时使用） */
export const ASSESSMENT_DOMAIN_KEYS = [
  "sensory_motor",
  "language",
  "cognitive",
  "social",
  "emotion_behavior",
  "self_care",
] as const;

export type AssessmentDomainKey = (typeof ASSESSMENT_DOMAIN_KEYS)[number];

/** IEP 评估领域来源：手动六大领域 / VB-MAPP / C-PEP-3 / 幼儿园融合评估 */
export type IepDomainMode =
  | "generic"
  | "vb_mapp"
  | "c_pep3"
  | "kg_integration"
  | "elem_integration";

export const IEP_DOMAIN_MODE_LABELS: Record<IepDomainMode, string> = {
  generic: "教师评估录入",
  vb_mapp: "VB-MAPP 评估",
  c_pep3: "C-PEP-3 评估",
  kg_integration: "幼儿园融合评估",
  elem_integration: "小学融合评估",
};

export const ASSESSMENT_DOMAIN_LABELS: Record<AssessmentDomainKey, string> = {
  sensory_motor: "感知觉与动作",
  language: "语言沟通",
  cognitive: "认知智力",
  social: "社会交往",
  emotion_behavior: "情绪行为",
  self_care: "生活自理",
};

/** 评估等级（1-5） */
export type AssessmentLevel = 1 | 2 | 3 | 4 | 5;

export const ASSESSMENT_LEVEL_LABELS: Record<AssessmentLevel, string> = {
  1: "极重度困难，需完全辅助",
  2: "重度困难，需大量辅助",
  3: "中度困难，需部分辅助",
  4: "轻度困难，需少量辅助",
  5: "基本达标，需偶尔提醒",
};

/** 八大 IEP 目标领域 */
export const IEP_DOMAIN_NAMES = [
  "感知觉与运动",
  "认知",
  "语言沟通",
  "社会适应",
  "生活自理",
  "情绪行为",
  "感官功能",
  "艺术休闲与职前准备",
] as const;

export type IEPDomainName = (typeof IEP_DOMAIN_NAMES)[number];

export type StudentBasicInfo = {
  name: string;
  gender?: string;
  birthDate?: string;
  age?: number;
  disabilityTypes?: string[];
  school?: string;
  grade?: string;
  className?: string;
  placementType?: string;
};

export type AssessmentDomain = {
  key: string;
  name: string;
  level?: AssessmentLevel;
  levelDescription?: string;
  strengths?: string;
  needs?: string;
  notes?: string;
};

/** generateIEP 函数的输入 */
export type AssessmentData = {
  student: StudentBasicInfo;
  domains: AssessmentDomain[];
  domainMode?: IepDomainMode;
  toolType?: "vb_mapp" | "c_pep3" | "kg_integration" | "elem_integration";
  assessmentSessionId?: string;
  assessDate?: string;
  assessorNotes?: string;
  schoolYear?: string;
  semester?: string;
  startDate?: string;
  endDate?: string;
};

/** 评估表单单个领域 */
export type IepFormDomain = {
  key: string;
  name: string;
  level: AssessmentLevel | null;
  description: string;
};

/** POST /api/iep/generate 请求体 */
export type IepGenerateRequest = {
  studentId: string;
  schoolYear: string;
  semester: "上学期" | "下学期";
  startDate: string;
  endDate: string;
  domainMode: IepDomainMode;
  assessmentSessionId?: string;
  toolType?: "vb_mapp" | "c_pep3" | "kg_integration" | "elem_integration";
  domains: IepFormDomain[];
};

export type IepRecord = {
  id: string;
  user_id: string;
  student_id: string;
  school_year: string;
  semester: string;
  start_date: string;
  end_date: string;
  assessment_data: IepGenerateRequest;
  token_usage: TokenUsage | null;
  generated_at: string | null;
  created_at: string;
};

export type IepGoalRecord = {
  id: string;
  iep_id: string;
  domain_name: string;
  current_level: string;
  long_term_goal: string;
  short_term_goals: ShortTermGoal[];
  sort_order: number;
};

export type ShortTermGoal = {
  content: string;
  assessmentMethod: string;
  startDate: string;
  endDate: string;
  /** @deprecated 使用 progress，与之保持同步 */
  status?: GoalProgressStatus;
  /** 进度状态 P/C/D/S/E */
  progress?: GoalProgressStatus;
  progress_notes?: string;
  progress_updated_at?: string;
};

/** IEP 短期目标进度状态 */
export type GoalProgressStatus = "P" | "C" | "D" | "S" | "E";

export const GOAL_PROGRESS_LABELS: Record<GoalProgressStatus, string> = {
  P: "通过",
  C: "继续",
  D: "放弃",
  S: "简化",
  E: "加深",
};

export type ProgressUpdateRequest = {
  iepGoalId: string;
  shortTermGoalIndex: number;
  progress: GoalProgressStatus;
  progress_notes?: string;
  progress_updated_at: string;
};

export type ProgressStats = {
  total: number;
  P: number;
  C: number;
  D: number;
  S: number;
  E: number;
  unset: number;
};

export type IepListItem = {
  id: string;
  student_id: string;
  student_name: string;
  school_year: string;
  semester: string;
  start_date: string;
  end_date: string;
  generated_at: string | null;
  total_goals: number;
  completed_count: number;
};

export type IepStatus = "draft" | "in_progress" | "completed";

export const IEP_STATUS_LABELS: Record<IepStatus, string> = {
  draft: "草稿",
  in_progress: "进行中",
  completed: "已完成",
};

export type IEPDomain = {
  name: string;
  currentLevel: string;
  longTermGoal: string;
  shortTermGoals: ShortTermGoal[];
};

export type TokenUsage = {
  /** 预估输入 token（约 2000） */
  estimatedInputTokens: number;
  /** 预估输出 token（约 3000） */
  estimatedOutputTokens: number;
  /** 实际输入 token（API 返回累计值） */
  actualInputTokens: number;
  /** 实际输出 token（API 返回累计值） */
  actualOutputTokens: number;
};

export type GeneratedIEP = {
  domains: IEPDomain[];
  tokenUsage: TokenUsage;
  generatedAt: string;
};

export type DeepSeekChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type DeepSeekChatResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export class DeepSeekError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DeepSeekError";
  }
}
