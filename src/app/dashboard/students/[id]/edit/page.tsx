import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";
import { createClient } from "@/lib/supabase/server";
import { studentToFormData, type Student } from "@/lib/types/student";

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const student = data as Student;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">编辑学生</h1>
        <p className="mt-1 text-sm text-zinc-400">
          修改 {student.name} 的档案信息
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <StudentForm
          mode="edit"
          studentId={student.id}
          initialData={studentToFormData(student)}
        />
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        <Link
          href="/dashboard/students"
          className="text-zinc-400 hover:text-zinc-200"
        >
          返回学生列表
        </Link>
      </p>
    </div>
  );
}
