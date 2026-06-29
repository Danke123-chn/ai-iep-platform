import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">添加学生</h1>
        <p className="mt-1 text-sm text-zinc-400">填写学生基本信息，建立档案</p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <StudentForm mode="create" />
      </div>
    </div>
  );
}
