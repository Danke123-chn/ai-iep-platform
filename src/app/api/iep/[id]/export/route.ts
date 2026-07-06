import {
  buildIepPdfBuffer,
  buildIepWordBuffer,
  buildProgressReportWordBuffer,
  generateProgressReportContent,
  getIepExportFilename,
  getProgressReportFilename,
  loadIepExportData,
} from "@/lib/iep-export";
import { DeepSeekError } from "@/types/iep";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (!format || !["pdf", "word", "progress"].includes(format)) {
      return NextResponse.json(
        { error: "请指定 format 参数：pdf、word 或 progress" },
        { status: 400 },
      );
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const data = await loadIepExportData(id);
    if (!data) {
      return NextResponse.json({ error: "IEP 不存在或无权访问" }, { status: 404 });
    }

    const studentName = data.student?.name ?? "学生";

    if (format === "word") {
      const buffer = await buildIepWordBuffer(data);
      const filename = getIepExportFilename(studentName, data.iep.school_year, "docx");
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    if (format === "pdf") {
      const buffer = await buildIepPdfBuffer(data);
      const filename = getIepExportFilename(studentName, data.iep.school_year, "pdf");
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    const reportContent = await generateProgressReportContent(data);
    const buffer = await buildProgressReportWordBuffer(data, reportContent);
    const filename = getProgressReportFilename(studentName, data.iep.school_year);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    if (err instanceof DeepSeekError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("IEP export error:", err);
    return NextResponse.json({ error: "导出失败，请稍后再试" }, { status: 500 });
  }
}
