/** Public app origin — required behind Coolify/reverse proxies where request.url is localhost. */
export function getRequestOrigin(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  if (!request) {
    return "http://localhost:3000";
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto = forwardedProto || (host?.includes("localhost") ? "http" : "https");

    if (host) {
      return `${proto}://${host}`;
    }
  }

  const host = request.headers.get("host")?.split(",")[0]?.trim();

  if (host && host !== "localhost:3000" && !host.startsWith("127.0.0.1")) {
    const proto =
      forwardedProto || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

/** Base URL for Supabase auth email links. */
export function getAuthRedirectOrigin(request?: Request): string {
  return getRequestOrigin(request);
}

export function getPasswordResetCallbackUrl(request?: Request): string {
  const origin = getAuthRedirectOrigin(request);
  const next = encodeURIComponent("/auth/reset-password");
  return `${origin}/auth/callback?next=${next}`;
}
