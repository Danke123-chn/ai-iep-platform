import {
  buildCpep3ReportWordBuffer,
  generateCpep3ReportNarratives,
  getCpep3ReportFilename,
  loadCpep3ReportData,
  saveCpep3ReportContent,
} from "@/lib/cpep3-report";
import type { Cpep3ReportContent } from "@/lib/cpep3-report/types";
import {
  buildIntegrationReportWordBuffer,
  generateIntegrationReportNarratives,
  getIntegrationReportFilename,
  loadIntegrationReportData,
  saveIntegrationReportContent,
} from "@/lib/integration-report";
import type { IntegrationReportContent } from "@/lib/integration-report/types";
import {
  buildVbMappReportWordBuffer,
  generateVbMappReportNarratives,
  getVbMappReportFilename,
  loadVbMappReportData,
  saveVbMappReportContent,
} from "@/lib/vbmapp-report";
import type { VbMappReportContent } from "@/lib/vbmapp-report/types";
import { isIntegrationTool } from "@/lib/assessments/integration-assessment-config";
import type { AssessmentTool } from "@/lib/types/assessment_types";
import { DeepSeekError } from "@/types/iep";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ sessionId: string }> };

async function loadSessionTool(
  studentId: string,
  sessionId: string,
  userId: string,
) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_sessions")
    .select("tool_type")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("assessor_id", userId)
    .single();
  return data?.tool_type as AssessmentTool | undefined;
}

function wordResponse(buffer: Buffer, filename: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

export async function GET(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const format = searchParams.get("format");

  if (!studentId) {
    return NextResponse.json({ error: "缺少 studentId" }, { status: 400 });
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const toolType = await loadSessionTool(studentId, sessionId, user.id);

  if (toolType === "c_pep3") {
    const data = await loadCpep3ReportData(studentId, sessionId, user.id);
    if (!data) {
      return NextResponse.json({ error: "评估不存在或无权访问" }, { status: 404 });
    }

    if (format === "word") {
      const buffer = await buildCpep3ReportWordBuffer(data);
      const filename = getCpep3ReportFilename(
        data.student.name,
        data.session.session_date,
        "docx",
      );
      return wordResponse(buffer, filename);
    }

    return NextResponse.json({ studentId, sessionId, toolType, report: data });
  }

  if (toolType && isIntegrationTool(toolType)) {
    const data = await loadIntegrationReportData(
      studentId,
      sessionId,
      user.id,
    );
    if (!data) {
      return NextResponse.json({ error: "评估不存在或无权访问" }, { status: 404 });
    }

    if (format === "word") {
      const buffer = await buildIntegrationReportWordBuffer(data);
      const filename = getIntegrationReportFilename(
        data.toolType,
        data.student.name,
        data.session.session_date,
        "docx",
      );
      return wordResponse(buffer, filename);
    }

    return NextResponse.json({ studentId, sessionId, toolType, report: data });
  }

  const data = await loadVbMappReportData(studentId, sessionId, user.id);
  if (!data) {
    return NextResponse.json({ error: "评估不存在或无权访问" }, { status: 404 });
  }

  if (format === "word") {
    const buffer = await buildVbMappReportWordBuffer(data);
    const filename = getVbMappReportFilename(
      data.student.name,
      data.session.session_date,
      "docx",
    );
    return wordResponse(buffer, filename);
  }

  return NextResponse.json({
    studentId,
    sessionId,
    toolType: toolType ?? "vb_mapp",
    report: data,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = (await request.json()) as {
      studentId?: string;
      action?: "generate" | "save";
      content?:
        | VbMappReportContent
        | Cpep3ReportContent
        | IntegrationReportContent;
    };

    if (!body.studentId) {
      return NextResponse.json({ error: "缺少 studentId" }, { status: 400 });
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const toolType = await loadSessionTool(
      body.studentId,
      sessionId,
      user.id,
    );

    if (toolType === "c_pep3") {
      const data = await loadCpep3ReportData(
        body.studentId,
        sessionId,
        user.id,
      );
      if (!data) {
        return NextResponse.json({ error: "评估不存在或无权访问" }, { status: 404 });
      }

      if (body.action === "save" && body.content) {
        const error = await saveCpep3ReportContent(
          sessionId,
          user.id,
          body.content as Cpep3ReportContent,
        );
        if (error) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ content: body.content });
      }

      if (body.action === "generate") {
        const content = await generateCpep3ReportNarratives(data);
        const error = await saveCpep3ReportContent(
          sessionId,
          user.id,
          content,
        );
        if (error) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ content });
      }

      return NextResponse.json({ error: "无效 action" }, { status: 400 });
    }

    if (toolType && isIntegrationTool(toolType)) {
      const data = await loadIntegrationReportData(
        body.studentId,
        sessionId,
        user.id,
      );
      if (!data) {
        return NextResponse.json({ error: "评估不存在或无权访问" }, { status: 404 });
      }

      if (body.action === "save" && body.content) {
        const error = await saveIntegrationReportContent(
          sessionId,
          user.id,
          body.content as IntegrationReportContent,
        );
        if (error) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ content: body.content });
      }

      if (body.action === "generate") {
        const content = await generateIntegrationReportNarratives(data);
        const error = await saveIntegrationReportContent(
          sessionId,
          user.id,
          content,
        );
        if (error) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ content });
      }

      return NextResponse.json({ error: "无效 action" }, { status: 400 });
    }

    const data = await loadVbMappReportData(
      body.studentId,
      sessionId,
      user.id,
    );
    if (!data) {
      return NextResponse.json({ error: "评估不存在或无权访问" }, { status: 404 });
    }

    if (body.action === "save" && body.content) {
      const error = await saveVbMappReportContent(
        sessionId,
        user.id,
        body.content as VbMappReportContent,
      );
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ content: body.content });
    }

    if (body.action === "generate") {
      const content = await generateVbMappReportNarratives(data);
      const error = await saveVbMappReportContent(
        sessionId,
        user.id,
        content,
      );
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ content });
    }

    return NextResponse.json({ error: "无效 action" }, { status: 400 });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Assessment report API error:", err);
    return NextResponse.json({ error: "处理失败，请稍后再试" }, { status: 500 });
  }
}
