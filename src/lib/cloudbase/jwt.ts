export type CloudBaseJwtUser = {
  id: string;
  email?: string;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  return atob(padded);
}

export function parseJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(
  token: string,
  leewaySeconds = 0,
): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;

  const exp = payload.exp;
  if (typeof exp !== "number") return false;

  return Math.floor(Date.now() / 1000) >= exp - leewaySeconds;
}

export function isAuthSessionExpiredError(message: string | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("access_token_expired") ||
    normalized.includes("token has expired")
  );
}

export function getUserFromAccessToken(
  token: string,
): CloudBaseJwtUser | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const id =
    (typeof payload.sub === "string" && payload.sub) ||
    (typeof payload.uid === "string" && payload.uid) ||
    (typeof payload.user_id === "string" && payload.user_id) ||
    null;

  if (!id) return null;

  return {
    id,
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
}
