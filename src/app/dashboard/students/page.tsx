import { StudentList } from "@/components/students/student-list";
import { createClient } from "@/lib/supabase/server";
import type { Student } from "@/lib/types/student";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  const students = (error ? [] : data ?? []) as Student[];

  return <StudentList initialStudents={students} />;
}
