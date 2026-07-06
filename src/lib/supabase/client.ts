"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserApp } from "@/lib/cloudbase/browser-app";
import { createAuthCompat } from "@/lib/cloudbase/auth-compat";

type CloudBaseApp = ReturnType<typeof getBrowserApp> & {
  rdb: () => { from: (table: string) => unknown };
};

export function createClient(): SupabaseClient {
  const app = getBrowserApp() as CloudBaseApp;
  const auth = app.auth({ persistence: "local" });

  return {
    auth: createAuthCompat(auth),
    from: (table: string) => app.rdb().from(table),
  } as unknown as SupabaseClient;
}
