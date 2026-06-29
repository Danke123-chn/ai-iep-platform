"use client";

import Link from "next/link";
import { formatDisabilityTypes, type Student } from "@/lib/types/student";

type StudentCardProps = {
  student: Student;
  onDelete: (student: Student) => void;
};

export function StudentCard({ student, onDelete }: StudentCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-zinc-100">{student.name}</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">障碍类型</dt>
            <dd className="text-zinc-300">
              {formatDisabilityTypes(student.disability_types)}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">年级</dt>
            <dd className="text-zinc-300">{student.grade || "未填写"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">学校</dt>
            <dd className="text-zinc-300">{student.school || "未填写"}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-5 flex flex-col gap-2 border-t border-zinc-800 pt-4">
        <Link
          href={`/dashboard/students/${student.id}/assessments/new`}
          className="rounded-lg px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#534AB7" }}
        >
          专业评估
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/students/${student.id}/edit`}
            className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            编辑
          </Link>
          <button
            type="button"
            onClick={() => onDelete(student)}
            className="flex-1 rounded-lg border border-red-900/50 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
