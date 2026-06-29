import { createClient } from "@/lib/supabase/server";
import type { GoalProgressStatus, ShortTermGoal } from "@/types/iep";
import { NextResponse } from "next/server";

type ProgressBody = {
  iepGoalId: string;
  shortTermGoalIndex: number;
  progress: GoalProgressStatus;
  progress_notes?: string;
  progress_updated_at: string;
};

const VALID_PROGRESS: GoalProgressStatus[] = ["P", "C", "D", "S", "E"];

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ProgressBody>;

    if (
      !body.iepGoalId ||
      body.shortTermGoalIndex === undefined ||
      !body.progress ||
      !body.progress_updated_at
    ) {
      return NextResponse.json({ error: "请求数据不完整" }, { status: 400 });
    }

    if (!VALID_PROGRESS.includes(body.progress)) {
      return NextResponse.json({ error: "无效的进度状态" }, { status: 400 });
    }

    const { data: goalRow, error: fetchError } = await supabase
      .from("iep_goals")
      .select("id, iep_id, short_term_goals")
      .eq("id", body.iepGoalId)
      .single();

    if (fetchError || !goalRow) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    const { data: iep, error: iepError } = await supabase
      .from("ieps")
      .select("user_id")
      .eq("id", goalRow.iep_id)
      .single();

    if (iepError || !iep || iep.user_id !== user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const shortTermGoals = [...(goalRow.short_term_goals as ShortTermGoal[])];
    const index = body.shortTermGoalIndex;

    if (index < 0 || index >= shortTermGoals.length) {
      return NextResponse.json({ error: "短期目标索引无效" }, { status: 400 });
    }

    shortTermGoals[index] = {
      ...shortTermGoals[index],
      progress: body.progress,
      status: body.progress,
      progress_notes: body.progress_notes?.trim() || undefined,
      progress_updated_at: body.progress_updated_at,
    };

    const { error: updateError } = await supabase
      .from("iep_goals")
      .update({ short_term_goals: shortTermGoals })
      .eq("id", body.iepGoalId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ short_term_goal: shortTermGoals[index] });
  } catch (err) {
    console.error("Progress update error:", err);
    return NextResponse.json({ error: "更新进度失败" }, { status: 500 });
  }
}
