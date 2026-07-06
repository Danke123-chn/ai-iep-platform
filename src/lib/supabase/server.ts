import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createAuthCompat } from "@/lib/cloudbase/auth-compat";
import {
  CLOUDBASE_SESSION_COOKIE,
  isCloudBaseConfigured,
} from "@/lib/cloudbase/config";
import { createAuthenticatedPostgrestClient } from "@/lib/cloudbase/server-rdb";
import { createServerApp } from "@/lib/cloudbase/server-app";

type CloudBaseApp = ReturnType<typeof createServerApp> & {
  rdb: () => { from: (table: string) => unknown };
};

export async function createClient(): Promise<SupabaseClient> {
  if (!isCloudBaseConfigured()) {
    throw new Error(
      "CloudBase 环境变量未配置，请检查 NEXT_PUBLIC_CLOUDBASE_ENV_ID 与 NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY。",
    );
  }

  const app = createServerApp() as CloudBaseApp;
  const auth = app.auth();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CLOUDBASE_SESSION_COOKIE)?.value;

  if (accessToken) {
    const postgrest = createAuthenticatedPostgrestClient(accessToken);

    return {
      auth: createAuthCompat(auth, accessToken),
      from: (table: string) => postgrest.from(table),
    } as unknown as SupabaseClient;
  }

  return {
    auth: createAuthCompat(auth),
    from: (table: string) => app.rdb().from(table),
  } as unknown as SupabaseClient;
}
