import { NextResponse } from "next/server";
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

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

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

  const studentId = formData.get("studentId");
  const file = formData.get("file");

  if (typeof studentId !== "string" || !studentId) {
    return NextResponse.json({ error: "缺少 studentId" }, { status: 400 });
  }

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

  const { data: session, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("id, tool_type, status, student_id")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("assessor_id", user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "评估会话不存在或无权限" }, { status: 404 });
  }

  if (session.tool_type !== "uploaded_report") {
    return NextResponse.json({ error: "该会话不是上传报告类型" }, { status: 400 });
  }

  const { data: student } = await supabase
    .from("students")
    .select("name")
    .eq("id", studentId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "学生不存在" }, { status: 404 });
  }

  try {
    const content = await extractReportContent(file);
    const interpretation = await interpretUploadedReport({
      content,
      studentName: student.name,
    });

    const { error: updateError } = await supabase
      .from("assessment_sessions")
      .update({
        status: "completed",
        summary: JSON.stringify(interpretation),
        notes: `上传文件：${interpretation.fileName}`,
      })
      .eq("id", sessionId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message ?? "保存解读结果失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ interpretation });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    const message =
      err instanceof Error ? err.message : "报告解读失败，请稍后再试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
