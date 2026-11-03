/** Restrict form `returnTo` to admin paths (avoid open redirects). */
export function safeAdminReturnPath(
  raw: string,
  fallback = "/admin/artikel",
): string {
  const path = raw.trim();
  if (!path.startsWith("/admin") || path.includes("://") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
