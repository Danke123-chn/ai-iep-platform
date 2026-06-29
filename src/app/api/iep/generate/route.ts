import { generateIEP } from "@/lib/deepseek";
import { toAssessmentData, validateIepGenerateRequest } from "@/lib/iep-utils";
import { createClient } from "@/lib/supabase/server";
import type { IepGenerateRequest } from "@/types/iep";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import { DeepSeekError } from "@/types/iep";
import { NextResponse } from "next/server";
import type { Student } from "@/lib/types/student";

/** IEP 生成含 4 轮 DeepSeek 调用，需较长执行时间 */
export const maxDuration = 600;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const payload = validateIepGenerateRequest(body);

    if (!payload) {
      return NextResponse.json(
        { error: "请求数据不完整，请填写全部评估领域" },
        { status: 400 },
      );
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", payload.studentId)
      .eq("user_id", user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "学生不存在或无权访问" }, { status: 404 });
    }

    const assessmentData = toAssessmentData(payload, student as Student);
    const generated = await generateIEP(assessmentData);

    const { data: iep, error: iepError } = await supabase
      .from("ieps")
      .insert({
        user_id: user.id,
        student_id: payload.studentId,
        school_year: payload.schoolYear,
        semester: payload.semester,
        start_date: payload.startDate,
        end_date: payload.endDate,
        assessment_data: payload,
        token_usage: generated.tokenUsage,
        generated_at: generated.generatedAt,
      })
      .select("id")
      .single();

    if (iepError || !iep) {
      return NextResponse.json(
        { error: getDbErrorMessage(iepError?.message ?? "保存 IEP 失败") },
        { status: 500 },
      );
    }

    const goalRows = generated.domains.map((domain, index) => ({
      iep_id: iep.id,
      domain_name: domain.name,
      current_level: domain.currentLevel,
      long_term_goal: domain.longTermGoal,
      short_term_goals: domain.shortTermGoals,
      sort_order: index,
    }));

    const { error: goalsError } = await supabase
      .from("iep_goals")
      .insert(goalRows);

    if (goalsError) {
      await supabase.from("ieps").delete().eq("id", iep.id);
      return NextResponse.json(
        { error: getDbErrorMessage(goalsError.message ?? "保存 IEP 目标失败") },
        { status: 500 },
      );
    }

    return NextResponse.json({ iep_id: iep.id });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }

    console.error("IEP generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成 IEP 失败，请稍后再试" },
      { status: 500 },
    );
  }
}
