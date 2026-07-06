import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CLOUDBASE_SESSION_COOKIE,
  isCloudBaseConfigured,
} from "@/lib/cloudbase/config";
import { isAccessTokenExpired } from "@/lib/cloudbase/jwt";

export async function requireDashboardSession(pathname = "/dashboard") {
  if (!isCloudBaseConfigured()) {
    redirect(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(CLOUDBASE_SESSION_COOKIE)?.value;

  if (!token) {
    redirect(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (isAccessTokenExpired(token)) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(pathname)}&reason=session_expired`,
    );
  }
}

export async function redirectIfAuthenticated() {
  if (!isCloudBaseConfigured()) return;

  const cookieStore = await cookies();
  const token = cookieStore.get(CLOUDBASE_SESSION_COOKIE)?.value;

  if (token && !isAccessTokenExpired(token)) {
    redirect("/dashboard");
  }

  if (token && isAccessTokenExpired(token)) {
    // Expired token is ignored; do not mutate cookies during RSC render.
    return;
  }
}
