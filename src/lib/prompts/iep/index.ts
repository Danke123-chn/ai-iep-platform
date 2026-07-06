import type { IepDomainMode } from "@/types/iep";
import {
  C_PEP3_SYSTEM_PROMPT,
  ELEM_INTEGRATION_SYSTEM_PROMPT,
  GENERIC_SYSTEM_PROMPT,
  KG_INTEGRATION_SYSTEM_PROMPT,
  VB_MAPP_SYSTEM_PROMPT,
} from "./system";

export {
  C_PEP3_SYSTEM_PROMPT,
  ELEM_INTEGRATION_SYSTEM_PROMPT,
  GENERIC_SYSTEM_PROMPT,
  KG_INTEGRATION_SYSTEM_PROMPT,
  VB_MAPP_SYSTEM_PROMPT,
} from "./system";
export { getAssessmentIntro, getGenerationSteps } from "./steps";

export function getIepSystemPrompt(mode: IepDomainMode = "generic"): string {
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
