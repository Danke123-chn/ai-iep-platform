/**
 * AI Prompt 目录 — 所有 DeepSeek 调用的 prompt 集中在此目录。
 * 优化 prompt 时优先修改对应文件，业务逻辑文件只负责组装数据与调用。
 */
export type PromptCatalogEntry = {
  id: string;
  file: string;
  trigger: string;
  model: string;
  flow: string;
  roles: ("system" | "user")[];
};

export const PROMPT_CATALOG: PromptCatalogEntry[] = [
  {
    id: "shared.expert-base",
    file: "src/lib/prompts/shared/expert-base.ts",
    trigger: "IEP 生成、上传报告解读等（组合进各 system prompt）",
    model: "deepseek-chat",
    flow: "通过 composeSystemPrompt() 与各场景专用段落拼接",
    roles: ["system"],
  },
  {
    id: "iep.generate",
    file: "src/lib/prompts/iep/",
    trigger: "POST /api/iep/generate、/api/iep/[id]/regenerate",
    model: "deepseek-chat",
    flow: "多轮对话 4 步：分析 → 长期目标 → 短期目标 → JSON",
    roles: ["system", "user"],
  },
  {
    id: "iep.system.generic",
    file: "src/lib/prompts/iep/system.ts → GENERIC_SYSTEM_PROMPT",
    trigger: "手动填表 IEP 生成",
    model: "deepseek-chat",
    flow: "Step 0 system",
    roles: ["system"],
  },
  {
    id: "iep.system.vb_mapp",
    file: "src/lib/prompts/iep/system.ts → VB_MAPP_SYSTEM_PROMPT",
    trigger: "VB-MAPP 评估后生成 IEP",
    model: "deepseek-chat",
    flow: "Step 0 system",
    roles: ["system"],
  },
  {
    id: "iep.system.c_pep3",
    file: "src/lib/prompts/iep/system.ts → C_PEP3_SYSTEM_PROMPT",
    trigger: "C-PEP-3 评估后生成 IEP",
    model: "deepseek-chat",
    flow: "Step 0 system",
    roles: ["system"],
  },
  {
    id: "iep.system.kg_integration",
    file: "src/lib/prompts/iep/system.ts → KG_INTEGRATION_SYSTEM_PROMPT",
    trigger: "幼儿园融合评估后生成 IEP",
    model: "deepseek-chat",
    flow: "Step 0 system",
    roles: ["system"],
  },
  {
    id: "iep.system.elem_integration",
    file: "src/lib/prompts/iep/system.ts → ELEM_INTEGRATION_SYSTEM_PROMPT",
    trigger: "小学融合评估后生成 IEP",
    model: "deepseek-chat",
    flow: "Step 0 system",
    roles: ["system"],
  },
  {
    id: "iep.steps",
    file: "src/lib/prompts/iep/steps.ts",
    trigger: "IEP 生成 Step 1–4",
    model: "deepseek-chat",
    flow: "每步一条 user message，Step 4 开启 jsonMode",
    roles: ["user"],
  },
  {
    id: "report.vb_mapp",
    file: "src/lib/prompts/reports/vb-mapp.ts",
    trigger: "VB-MAPP 评估报告 AI 解读",
    model: "deepseek-chat",
    flow: "单次调用，jsonMode",
    roles: ["system", "user"],
  },
  {
    id: "report.c_pep3",
    file: "src/lib/prompts/reports/c-pep3.ts",
    trigger: "C-PEP-3 评估报告 AI 解读",
    model: "deepseek-chat",
    flow: "单次调用，jsonMode",
    roles: ["system", "user"],
  },
  {
    id: "report.integration",
    file: "src/lib/prompts/reports/integration.ts",
    trigger: "幼儿园/小学融合评估报告 AI 解读",
    model: "deepseek-chat",
    flow: "单次调用，jsonMode",
    roles: ["system", "user"],
  },
  {
    id: "upload.interpret",
    file: "src/lib/prompts/upload/interpret.ts",
    trigger: "POST /api/assessments/[sessionId]/upload-report",
    model: "deepseek-chat",
    flow: "文本或图片 OCR 解读，jsonMode",
    roles: ["system", "user"],
  },
  {
    id: "progress.report",
    file: "src/lib/prompts/progress/report.ts",
    trigger: "IEP 进度报告导出",
    model: "deepseek-chat",
    flow: "单次调用，jsonMode",
    roles: ["system", "user"],
  },
];

export * from "./iep";
export {
  buildCpep3ReportSystemPrompt,
  C_PEP3_REPORT_USER_PROMPT_PREFIX,
} from "./reports/c-pep3";
export {
  buildIntegrationReportSystemPrompt,
  buildIntegrationReportUserPrompt,
} from "./reports/integration";
export {
  buildVbMappReportSystemPrompt,
  VB_MAPP_REPORT_USER_PROMPT_PREFIX,
} from "./reports/vb-mapp";
export {
  buildUploadReportImagePrompt,
  buildUploadReportTextPrompt,
  UPLOAD_REPORT_SYSTEM_PROMPT,
} from "./upload/interpret";
export {
  buildProgressReportUserPrompt,
  PROGRESS_REPORT_SYSTEM_PROMPT,
} from "./progress/report";
export {
  composeSystemPrompt,
  IEP_EXPERT_BASE,
  buildUploadInterpretSystemPrompt,
} from "./shared/expert-base";
