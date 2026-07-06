"use server";

import { cookies } from "next/headers";
import { CLOUDBASE_SESSION_COOKIE } from "@/lib/cloudbase/config";

export async function setSessionCookie(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(CLOUDBASE_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CLOUDBASE_SESSION_COOKIE);
}
