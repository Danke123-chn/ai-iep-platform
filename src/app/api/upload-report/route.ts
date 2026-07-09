import { NextResponse } from "next/server";
import { getAssessmentFormPath } from "@/lib/assessments/assessment-session-utils";
import {
  extractReportContent,
  isSupportedUploadMime,
  resolveUploadMimeType,
} from "@/lib/uploaded-report/extract-text";
import { interpretUploadedReport } from "@/lib/uploaded-report/interpret";
import { UPLOAD_REPORT_MAX_BYTES } from "@/lib/uploaded-report/types";
import { DeepSeekError } from "@/types/iep";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "无效的表单数据" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "请选择要上传的文件" }, { status: 400 });
  }

  if (file.size > UPLOAD_REPORT_MAX_BYTES) {
    return NextResponse.json(
      { error: "文件大小不能超过 10MB" },
      { status: 400 },
    );
  }

  const mimeType = resolveUploadMimeType(file);
  if (!isSupportedUploadMime(mimeType)) {
    return NextResponse.json(
      { error: "不支持的文件格式，请上传 Word、PDF 或图片" },
      { status: 400 },
    );
  }

  try {
    const content = await extractReportContent(file);
    const interpretation = await interpretUploadedReport({ content });
    const profile = interpretation.studentProfile;

    if (!profile) {
      return NextResponse.json(
        { error: "未能从报告中提取学生信息，请换一份更清晰的报告重试" },
        { status: 422 },
      );
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        user_id: user.id,
        name: profile.name,
        gender: profile.gender,
        birth_date: profile.birth_date,
        disability_types: profile.disability_types,
        school: profile.school,
        grade: profile.grade,
        class_name: profile.class_name,
        parent_name: profile.parent_name,
        parent_phone: profile.parent_phone,
        family_notes: profile.family_notes,
      })
      .select("id")
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: studentError?.message ?? "创建学生档案失败" },
        { status: 500 },
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        assessor_id: user.id,
        tool_type: "uploaded_report",
        status: "completed",
        summary: JSON.stringify(interpretation),
        notes: `上传文件：${interpretation.fileName}`,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: sessionError?.message ?? "创建评估会话失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      studentId: student.id,
      sessionId: session.id,
      interpretation,
      uploadReportPath: getAssessmentFormPath(
        student.id,
        session.id,
        "uploaded_report",
      ),
    });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    const message =
      err instanceof Error ? err.message : "报告解读失败，请稍后再试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
