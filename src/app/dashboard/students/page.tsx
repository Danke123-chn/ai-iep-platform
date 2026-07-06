import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { StudentList } from "@/components/students/student-list";
import { CLOUDBASE_SESSION_COOKIE } from "@/lib/cloudbase/config";
import { isAuthSessionExpiredError } from "@/lib/cloudbase/jwt";
import { createClient } from "@/lib/supabase/server";
import type { Student } from "@/lib/types/student";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isAuthSessionExpiredError(error.message)) {
      const cookieStore = await cookies();
      cookieStore.delete(CLOUDBASE_SESSION_COOKIE);
      redirect("/auth/login?redirect=/dashboard/students&reason=session_expired");
    }
    console.error("Failed to load students:", error.message);
  }

  const students = (error ? [] : (data ?? [])) as Student[];

  return <StudentList initialStudents={students} />;
}
