import { generateIEP } from "@/lib/deepseek";
import { toAssessmentData, validateIepGenerateRequest } from "@/lib/iep-utils";
import { createClient } from "@/lib/supabase/server";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import { DeepSeekError } from "@/types/iep";
import type { IepGenerateRequest, IepGoalRecord } from "@/types/iep";
import { NextResponse } from "next/server";
import type { Student } from "@/lib/types/student";

/** IEP 再次生成含 4 轮 DeepSeek 调用，需较长执行时间 */
export const maxDuration = 600;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: iep, error: iepError } = await supabase
      .from("ieps")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (iepError || !iep) {
      return NextResponse.json({ error: "IEP 不存在或无权访问" }, { status: 404 });
    }

    const payload = validateIepGenerateRequest(
      iep.assessment_data as IepGenerateRequest,
    );

    if (!payload) {
      return NextResponse.json(
        { error: "缺少有效的评估数据，无法再次生成。请返回编辑评估后重新创建 IEP。" },
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

    const { error: deleteError } = await supabase
      .from("iep_goals")
      .delete()
      .eq("iep_id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: getDbErrorMessage(deleteError.message ?? "清除旧目标失败") },
        { status: 500 },
      );
    }

    const goalRows = generated.domains.map((domain, index) => ({
      iep_id: id,
      domain_name: domain.name,
      current_level: domain.currentLevel,
      long_term_goal: domain.longTermGoal,
      short_term_goals: domain.shortTermGoals,
      sort_order: index,
    }));

    const { data: goals, error: goalsError } = await supabase
      .from("iep_goals")
      .insert(goalRows)
      .select("*");

    if (goalsError || !goals) {
      return NextResponse.json(
        { error: getDbErrorMessage(goalsError?.message ?? "保存新 IEP 目标失败") },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("ieps")
      .update({
        token_usage: generated.tokenUsage,
        generated_at: generated.generatedAt,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: getDbErrorMessage(updateError.message ?? "更新 IEP 记录失败") },
        { status: 500 },
      );
    }

    return NextResponse.json({
      goals: goals as IepGoalRecord[],
      generated_at: generated.generatedAt,
    });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }

    console.error("IEP regenerate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "再次生成 IEP 失败，请稍后再试" },
      { status: 500 },
    );
  }
}
