"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/lib/types/student";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentCard } from "./student-card";

type StudentListProps = {
  initialStudents: Student[];
};

export function StudentList({ initialStudents }: StudentListProps) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!deletingStudent) return;

    setDeleteLoading(true);
    setDeleteError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", deletingStudent.id);

    if (error) {
      setDeleteError(error.message);
      setDeleteLoading(false);
      return;
    }

    setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
    setDeletingStudent(null);
    setDeleteLoading(false);
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">学生档案</h1>
          <p className="mt-1 text-sm text-zinc-400">
            共 {students.length} 名学生
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
        >
          添加学生
        </Link>
      </div>

      {deleteError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          删除失败：{deleteError}
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-16 text-center">
          <p className="text-zinc-400">还没有学生档案，点击右上角添加</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onDelete={setDeletingStudent}
            />
          ))}
        </div>
      )}

      <DeleteStudentDialog
        studentName={deletingStudent?.name ?? ""}
        open={deletingStudent !== null}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleteLoading && setDeletingStudent(null)}
      />
    </>
  );
}
