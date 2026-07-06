import type cloudbase from "@cloudbase/js-sdk";
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/app/actions/auth";
import { getUserFromAccessToken } from "@/lib/cloudbase/jwt";

type AuthError = { message: string };
type SupabaseUser = { id: string; email?: string; identities?: unknown[] };

type CloudBaseAuth = ReturnType<
  ReturnType<typeof cloudbase.init>["auth"]
>;

function toAuthError(error: unknown): AuthError {
  if (error && typeof error === "object" && "message" in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: "认证失败，请稍后再试。" };
}

function mapCloudBaseUser(user: unknown): SupabaseUser | null {
  if (!user || typeof user !== "object") return null;

  const record = user as Record<string, unknown>;
  const id =
    (typeof record.id === "string" && record.id) ||
    (typeof record.uid === "string" && record.uid) ||
    (typeof record.sub === "string" && record.sub) ||
    null;

  if (!id) return null;

  return {
    id,
    email: typeof record.email === "string" ? record.email : undefined,
    identities: Array.isArray(record.identities) ? record.identities : undefined,
  };
}

async function persistSession(auth: CloudBaseAuth) {
  const tokenResult = await auth.getAccessToken();
  const accessToken =
    tokenResult?.accessToken ??
    (tokenResult as { access_token?: string } | null)?.access_token;

  if (accessToken) {
    await setSessionCookie(accessToken);
  }
}

export function createAuthCompat(auth: CloudBaseAuth, accessToken?: string) {
  return {
    async getUser(): Promise<{ data: { user: SupabaseUser | null }; error: AuthError | null }> {
      if (accessToken) {
        const user = getUserFromAccessToken(accessToken);
        if (user) {
          return { data: { user }, error: null };
        }
      }

      try {
        const result = await auth.getUser();
        const error = (result as { error?: AuthError | null }).error ?? null;
        if (error) {
          return { data: { user: null }, error: toAuthError(error) };
        }

        const data = (result as { data?: { user?: unknown } }).data;
        const user = mapCloudBaseUser(data?.user);
        return { data: { user }, error: null };
      } catch (error) {
        return { data: { user: null }, error: toAuthError(error) };
      }
    },

    async signInWithPassword(params: {
      email: string;
      password: string;
    }): Promise<{ data?: { user?: SupabaseUser | null }; error: AuthError | null }> {
      try {
        const result = await auth.signInWithPassword({
          email: params.email,
          password: params.password,
        });
        const error = (result as { error?: AuthError | null }).error ?? null;
        if (error) {
          return { error: toAuthError(error) };
        }

        await persistSession(auth);
        const userResult = await auth.getUser();
        const user = mapCloudBaseUser(
          (userResult as { data?: { user?: unknown } }).data?.user,
        );
        return { data: { user }, error: null };
      } catch (error) {
        return { error: toAuthError(error) };
      }
    },

    async signUp(params: {
      email: string;
      password: string;
      options?: { emailRedirectTo?: string };
    }): Promise<{
      data: { user: SupabaseUser | null; session: null };
      error: AuthError | null;
    }> {
      void params.options;
      return {
        data: { user: null, session: null },
        error: {
          message:
            "请使用注册页的邮箱验证码流程完成注册（CloudBase 不支持 Supabase 式一键 signUp）。",
        },
      };
    },

    async signOut(): Promise<{ error: AuthError | null }> {
      try {
        await auth.signOut();
        await clearSessionCookie();
        return { error: null };
      } catch (error) {
        await clearSessionCookie();
        return { error: toAuthError(error) };
      }
    },

    async resetPasswordForEmail(
      email: string,
      options?: { redirectTo?: string },
    ): Promise<{ error: AuthError | null }> {
      try {
        const result = await auth.resetPasswordForEmail(email, options);
        const error = (result as { error?: AuthError | null }).error ?? null;
        return { error: error ? toAuthError(error) : null };
      } catch (error) {
        return { error: toAuthError(error) };
      }
    },

    async updateUser(params: {
      password?: string;
    }): Promise<{ error: AuthError | null }> {
      try {
        const result = await auth.updateUser(params);
        const error = (result as { error?: AuthError | null }).error ?? null;
        return { error: error ? toAuthError(error) : null };
      } catch (error) {
        return { error: toAuthError(error) };
      }
    },

    async verifyOtp(_params: unknown): Promise<{ error: AuthError | null }> {
      try {
        const result = await auth.verifyOtp(
          _params as Parameters<CloudBaseAuth["verifyOtp"]>[0],
        );
        const error = (result as { error?: AuthError | null }).error ?? null;
        if (!error) {
          await persistSession(auth);
        }
        return { error: error ? toAuthError(error) : null };
      } catch (error) {
        return { error: toAuthError(error) };
      }
    },

    onAuthStateChange(
      callback: (
        event: string,
        session: { user: SupabaseUser | null } | null,
      ) => void,
    ) {
      const subscription = auth.onAuthStateChange((payload: unknown) => {
        const event =
          (payload as { event?: string }).event ??
          (payload as { data?: { event?: string } }).data?.event ??
          "SIGNED_IN";
        const user = mapCloudBaseUser(
          (payload as { session?: { user?: unknown } }).session?.user ??
            (payload as { data?: { session?: { user?: unknown } } }).data
              ?.session?.user,
        );
        callback(event, user ? { user } : null);
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              subscription?.data?.subscription?.unsubscribe?.();
            },
          },
        },
      };
    },

    async exchangeCodeForSession(_code: string): Promise<{ error: AuthError | null }> {
      void _code;
      return {
        error: { message: "CloudBase 不使用 Supabase OAuth callback，请直接登录。" },
      };
    },
  };
}

export type AuthCompatClient = ReturnType<typeof createAuthCompat>;
