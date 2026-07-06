export const GENDER_OPTIONS = ["男", "女"] as const;
export type Gender = (typeof GENDER_OPTIONS)[number];

export const DISABILITY_TYPES = [
  "孤独症",
  "阿斯伯格",
  "发育迟缓",
  "注意力缺陷",
  "情绪行为障碍",
  "其他",
] as const;
export type DisabilityType = (typeof DISABILITY_TYPES)[number];

export const PLACEMENT_TYPES = [
  "普通班",
  "资源教室",
  "特教班",
  "送教上门",
  "个训课",
  "影子老师支持",
] as const;
export type PlacementType = (typeof PLACEMENT_TYPES)[number];

export type Student = {
  id: string;
  user_id: string;
  name: string;
  gender: Gender | null;
  birth_date: string | null;
  disability_types: DisabilityType[];
  school: string | null;
  grade: string | null;
  class_name: string | null;
  placement_types: PlacementType[];
  parent_name: string | null;
  parent_phone: string | null;
  family_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentFormData = {
  name: string;
  gender: Gender | "";
  birth_date: string;
  disability_types: DisabilityType[];
  school: string;
  grade: string;
  class_name: string;
  placement_types: PlacementType[];
  parent_name: string;
  parent_phone: string;
  family_notes: string;
};

export const EMPTY_STUDENT_FORM: StudentFormData = {
  name: "",
  gender: "",
  birth_date: "",
  disability_types: [],
  school: "",
  grade: "",
  class_name: "",
  placement_types: [],
  parent_name: "",
  parent_phone: "",
  family_notes: "",
};

export function studentToFormData(student: Student): StudentFormData {
  return {
    name: student.name,
    gender: student.gender ?? "",
    birth_date: student.birth_date ?? "",
    disability_types: student.disability_types ?? [],
    school: student.school ?? "",
    grade: student.grade ?? "",
    class_name: student.class_name ?? "",
    placement_types: student.placement_types ?? [],
    parent_name: student.parent_name ?? "",
    parent_phone: student.parent_phone ?? "",
    family_notes: student.family_notes ?? "",
  };
}

const PHONE_REGEX = /^1[3-9]\d{9}$/;

export function validateStudentForm(data: StudentFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "姓名为必填项";
  }

  if (data.parent_phone.trim() && !PHONE_REGEX.test(data.parent_phone.trim())) {
    errors.parent_phone = "请输入有效的手机号码（11位）";
  }

  return errors;
}

export function formatDisabilityTypes(types: string[]): string {
  if (!types.length) return "未填写";
  return types.join("、");
}

export function formatPlacementTypes(types: string[]): string {
  return formatDisabilityTypes(types);
}
