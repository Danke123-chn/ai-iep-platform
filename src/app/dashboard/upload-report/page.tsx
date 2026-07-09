import Link from "next/link";
import { UploadReportGettingStartedForm } from "@/components/assessments/upload-report-getting-started-form";

export default function UploadReportGettingStartedPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← 返回工具选择
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
          上传评估报告
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          上传已有评估报告，AI 将自动提取学生信息并建立档案
        </p>
      </div>

      <UploadReportGettingStartedForm />
    </div>
  );
}
