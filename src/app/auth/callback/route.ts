import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/auth/login";
  url.searchParams.set("message", "use_password_login");
  return NextResponse.redirect(url);
}
