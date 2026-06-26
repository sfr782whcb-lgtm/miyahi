export const SESSION_COOKIE = "miyyahi_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-session-secret-min-32-chars!!";
  }
  throw new Error("SESSION_SECRET must be set and at least 32 characters");
}
