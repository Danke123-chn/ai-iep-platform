// ============================================================
// AI IEP Platform - Assessment TypeScript Types
// 评估数据类型定义
// ============================================================

// ============================================================
// 通用类型
// ============================================================

export type AssessmentTool = 'vb_mapp' | 'c_pep3' | 'kg_integration' | 'elem_integration' | 'uploaded_report';
export type SessionStatus = 'in_progress' | 'completed';

export interface AssessmentSession {
  id: string;
  student_id: string;
  assessor_id: string;
  tool_type: AssessmentTool;
  status: SessionStatus;
  session_date: string;
  school_year: string | null;
  semester: "上学期" | "下学期" | null;
  plan_start_date: string | null;
  plan_end_date: string | null;
  total_score: number | null;
  summary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// VB-MAPP 定义类型
// ============================================================

export interface VbMappMilestone {
  id: string;
  domain: string;
  domain_label_zh: string;
  level: 1 | 2 | 3;
  milestone_number: number;
  description: string;
  age_range: string;
}

export interface VbMappBarrier {
  id: string;
  barrier_name: string;
  barrier_name_zh: string;
  category: string;
  sort_order: number;
}

export interface VbMappTransition {
  id: string;
  transition_name: string;
  transition_name_zh: string;
  category: string;
  sort_order: number;
}

// ============================================================
// VB-MAPP 评分类型
// ============================================================

export const VB_MAPP_NT = 'NT' as const;

export type MilestoneScore = typeof VB_MAPP_NT | '0' | '0.5' | '1';

/** 数据库存储值：NT 表示未测 */
export const VB_MAPP_MILESTONE_NT = VB_MAPP_NT;
export const VB_MAPP_BARRIER_NT = VB_MAPP_NT;
export const VB_MAPP_TRANSITION_NT = VB_MAPP_NT;

export type BarrierScore = typeof VB_MAPP_NT | '0' | '1' | '2' | '3' | '4';
/** 过渡评估与障碍评估共用同一严重度量表 */
export type TransitionScore = BarrierScore;

export function isVbMappNt(score: string | number | undefined | null): boolean {
  return score === VB_MAPP_NT || score === -1 || score === '-1';
}

export function normalizeMilestoneScore(score: unknown): MilestoneScore | undefined {
  if (score === null || score === undefined) return undefined;
  const s = String(score);
  if (isVbMappNt(s)) return VB_MAPP_NT;
  if (s === '0' || s === '0.5' || s === '1') return s;
  return undefined;
}

export function normalizeBarrierScore(score: unknown): BarrierScore | undefined {
  if (score === null || score === undefined) return undefined;
  const s = String(score);
  if (isVbMappNt(s)) return VB_MAPP_NT;
  if (s === '0' || s === '1' || s === '2' || s === '3' || s === '4') return s;
  return undefined;
}

export interface VbMappMilestoneScore {
  id: string;
  session_id: string;
  milestone_id: string;
  score: MilestoneScore;
  notes: string | null;
  assessed_at: string;
}

export interface VbMappBarrierScore {
  id: string;
  session_id: string;
  barrier_id: string;
  score: BarrierScore;
  notes: string | null;
}

export interface VbMappTransitionScore {
  id: string;
  session_id: string;
  transition_id: string;
  score: TransitionScore;
  notes: string | null;
}

// ============================================================
// C-PEP-3 定义类型
// ============================================================

export interface Cpep3DevelopmentalItem {
  id: string;
  domain: string;
  domain_label_zh: string;
  item_number: number;
  description: string;
  age_range: string | null;
}

export interface Cpep3PathologicalItem {
  id: string;
  domain: string;
  domain_label_zh: string;
  item_number: number;
  description: string;
}

// ============================================================
// C-PEP-3 评分类型
// ============================================================

export type DevScore = 'P' | 'E' | 'F' | 'NT'; // 通过 / 中间反应 / 不通过 / 未测
export type PatScore = 'A' | 'M' | 'S' | 'NT'; // 适当 / 轻度 / 严重 / 未测
export const C_PEP3_NT = 'NT' as const;

export interface Cpep3DevelopmentalScore {
  id: string;
  session_id: string;
  item_id: string;
  score: DevScore;
  notes: string | null;
  assessed_at: string;
}

export interface Cpep3PathologicalScore {
  id: string;
  session_id: string;
  item_id: string;
  score: PatScore;
  notes: string | null;
}

// ============================================================
// 汇总视图类型（用于展示统计结果）
// ============================================================

export interface VbMappMilestoneSummary {
  session_id: string;
  student_id: string;
  session_date: string;
  domain: string;
  domain_label_zh: string;
  level: number;
  total_milestones: number;
  passed: number;
  partial: number;
  not_passed: number;
  not_tested: number;
  total_score: number;
}

export interface Cpep3DevSummary {
  session_id: string;
  student_id: string;
  session_date: string;
  domain: string;
  domain_label_zh: string;
  total_items: number;
  passed_count: number;
  emerging_count: number;
  failed_count: number;
  not_tested_count: number;
  pass_rate: number | null;
}

export interface Cpep3PatSummary {
  session_id: string;
  student_id: string;
  session_date: string;
  domain: string;
  domain_label_zh: string;
  total_items: number;
  appropriate_count: number;
  mild_count: number;
  severe_count: number;
  not_tested_count: number;
}

// ============================================================
// 幼儿园融合能力评估（入园）
// ============================================================

export type KgIntegrationSection = 'activity' | 'skill';

export type KgIntegrationScore = 'NA' | '0' | '1' | '2' | 'NT';

export const KG_INTEGRATION_NT = 'NT' as const;

export interface KgIntegrationItem {
  id: string;
  section: KgIntegrationSection;
  domain: string;
  domain_label_zh: string;
  category: string;
  skill_name: string;
  description: string;
  item_number: number;
  sort_order: number;
}

export interface KgIntegrationItemScore {
  id: string;
  session_id: string;
  item_id: string;
  score: KgIntegrationScore;
  notes: string | null;
  assessed_at: string;
}

export interface KgIntegrationBehaviorRecord {
  id: string;
  session_id: string;
  behavior_description: string | null;
  occurrence_time: string | null;
  frequency_intensity: string | null;
  location: string | null;
  duration: string | null;
  measures_taken: string | null;
  behavior_impact: string | null;
  sort_order: number;
  created_at?: string;
}

export interface KgIntegrationSummary {
  session_id: string;
  student_id: string;
  session_date: string;
  section: KgIntegrationSection;
  domain: string;
  domain_label_zh: string;
  total_items: number;
  score_2_count: number;
  score_1_count: number;
  score_0_count: number;
  na_count: number;
  not_tested_count: number;
  pass_rate: number | null;
}

export const KG_INTEGRATION_SCORE_OPTIONS = [
  { value: '2', label: '2分', color: '#5DCAA5' },
  { value: '1', label: '1分', color: '#FAC775' },
  { value: '0', label: '0分', color: '#F09595' },
  { value: 'NA', label: '不适用', color: '#B4B2A9' },
  { value: 'NT', label: '未测', color: '#71717A' },
] as const;

export const KG_INTEGRATION_SECTION_LABELS: Record<KgIntegrationSection, string> = {
  activity: 'A. 融合活动评估',
  skill: 'B. 融合技能评估',
};

export const KG_INTEGRATION_IEP_DOMAINS = [
  '生活活动',
  '区域活动',
  '教学活动',
  '户外活动',
  '语言与沟通',
  '社交与情绪',
  '学业技能',
  '问题行为',
] as const;

// ============================================================
// VB-MAPP 领域常量（前端表单分组用）
// ============================================================

export const VB_MAPP_LEVELS = {
  1: { label: '第一级', ageRange: '0-18个月', color: '#5DCAA5' },
  2: { label: '第二级', ageRange: '18-30个月', color: '#FAC775' },
  3: { label: '第三级', ageRange: '30-48个月', color: '#D85A30' },
} as const;

export const VB_MAPP_DOMAINS_ZH: Record<string, string> = {
  mand: '提要求',
  tact: '命名',
  listener_responding: '听者技能',
  vp_mts: '视觉感知与配对',
  independent_play: '独立游戏',
  social_behavior: '社交行为与社交游戏',
  motor_imitation: '动作模仿',
  spontaneous_vocal: '自发发声行为',
  echoic: '仿说',
  intraverbal: '对话/互动语言',
  lrffc: '听者功能特征类别',
  syntax_grammar: '句法与语法',
  reading: '阅读',
};

export const VB_MAPP_MILESTONE_SCORE_OPTIONS = [
  { value: '0', label: '0分', color: '#F09595' },
  { value: '0.5', label: '1/2分', color: '#FAC775' },
  { value: '1', label: '1分', color: '#5DCAA5' },
  { value: 'NT', label: '未测', color: '#B4B2A9' },
] as const;

export const VB_MAPP_BARRIER_SCORE_OPTIONS = [
  { value: '0', label: '无问题', color: '#5DCAA5' },
  { value: '1', label: '轻微', color: '#97C459' },
  { value: '2', label: '中度', color: '#FAC775' },
  { value: '3', label: '显著', color: '#F0997B' },
  { value: '4', label: '严重', color: '#E24B4A' },
  { value: 'NT', label: '未测', color: '#B4B2A9' },
] as const;

/** 障碍 / 过渡评估共用 */
export const VB_MAPP_SEVERITY_SCORE_OPTIONS = VB_MAPP_BARRIER_SCORE_OPTIONS;

export function getVbMappSeverityLabel(score: string | number): string {
  if (isVbMappNt(score)) return '未测';
  const key = String(score);
  return (
    VB_MAPP_BARRIER_SCORE_OPTIONS.find((o) => o.value === key)?.label ?? key
  );
}

// ============================================================
// C-PEP-3 领域常量
// ============================================================

export const C_PEP3_DEV_DOMAINS_ZH: Record<string, string> = {
  imitation: '模仿',
  perception: '感知',
  fine_motor: '精细动作',
  gross_motor: '粗大动作',
  eye_hand_coordination: '手眼协调',
  cognitive_performance: '认知表现',
  verbal_cognition: '口语认知',
};

export const C_PEP3_PAT_DOMAINS_ZH: Record<string, string> = {
  affect: '情感',
  interpersonal: '人际关系',
  material_play: '材料游戏的种类与范围',
  sensory_modes: '感觉模式',
  language: '语言',
};

export const C_PEP3_DEV_SCORE_OPTIONS = [
  { value: 'P', label: '通过', color: '#5DCAA5' },
  { value: 'E', label: '中间反应', color: '#FAC775' },
  { value: 'F', label: '不通过', color: '#F09595' },
  { value: 'NT', label: '未测', color: '#B4B2A9' },
] as const;

export const C_PEP3_PAT_SCORE_OPTIONS = [
  { value: 'A', label: '适当', color: '#5DCAA5' },
  { value: 'M', label: '轻度异常', color: '#FAC775' },
  { value: 'S', label: '严重异常', color: '#E24B4A' },
  { value: 'NT', label: '未测', color: '#B4B2A9' },
] as const;

// ============================================================
// 工具选择配置（前端选择器用）
// ============================================================

export const ASSESSMENT_TOOLS = [
  {
    value: 'uploaded_report' as const,
    label: '上传评估报告',
    iconLabel: '上传',
    fullName: 'Upload External Assessment Report',
    fullNameZh: '上传外部评估报告',
    description: '上传 Word、PDF 或图片格式的已有评估报告，由 AI 解读并生成 IEP',
    ageRange: '不限',
    totalItems: 0,
    sections: [
      '支持 Word / PDF / 图片',
      'AI 自动识别评估类型',
      '解读报告并预填 IEP 领域',
    ],
    color: '#7C3AED',
  },
  {
    value: 'vb_mapp' as const,
    label: 'VB-MAPP',
    iconLabel: 'VB',
    fullName: 'Verbal Behavior Milestones Assessment and Placement Program',
    fullNameZh: '语言行为里程碑评估与安置计划',
    description: '基于行为分析的儿童语言能力里程碑评估，ABA干预金标准',
    ageRange: '0-48个月发展水平',
    totalItems: 170,
    sections: ['里程碑评估 (170项)', '障碍评估 (24项)', '过渡评估 (18项)'],
    color: '#534AB7',
  },
  {
    value: 'c_pep3' as const,
    label: 'C-PEP-3',
    iconLabel: 'C-PEP',
    fullName: 'Psychoeducational Profile Revised, Chinese Version 3',
    fullNameZh: '中国版心理教育量表第三版',
    description: '中国本土化心理教育量表，评估发展水平与病理行为',
    ageRange: '12-83个月',
    totalItems: 154,
    sections: ['发展领域 (97项/7大领域)', '病理领域 (57项/5大领域)'],
    color: '#0F6E56',
  },
  {
    value: 'kg_integration' as const,
    label: '幼儿园融合评估',
    iconLabel: '融合',
    fullName: 'Kindergarten Integrated Education Assessment',
    fullNameZh: '幼儿园融合能力评估表（入园）',
    description: '评估幼儿园融合活动中生活、区域、教学、户外及语言社交等融合能力',
    ageRange: '幼儿园阶段（3-6岁）',
    totalItems: 138,
    sections: [
      'A. 融合活动评估 (124分)',
      'B. 融合技能评估',
      'C. 融合问题行为评估',
    ],
    color: '#D97706',
  },
  {
    value: 'elem_integration' as const,
    label: '小学融合评估',
    iconLabel: '融合',
    fullName: 'Elementary Integrated Education Assessment',
    fullNameZh: '小学融合能力评估表（入校）',
    description: '评估小学融合活动中生活、教学、户外及语言社交、学业等融合能力',
    ageRange: '小学阶段（6-12岁）',
    totalItems: 144,
    sections: [
      'A. 融合活动评估 (108分)',
      'B. 融合技能评估',
      'C. 融合问题行为评估',
    ],
    color: '#2563EB',
  },
] as const;
