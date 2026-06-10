/** Base URL for Supabase auth email links (set in Coolify for production). */
export function getAuthRedirectOrigin(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  if (request) {
    return new URL(request.url).origin;
  }

  return "http://localhost:3000";
}

export function getPasswordResetCallbackUrl(request?: Request): string {
  const origin = getAuthRedirectOrigin(request);
  const next = encodeURIComponent("/auth/reset-password");
  return `${origin}/auth/callback?next=${next}`;
}
