function normalizeEmail(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function getUserAccountEmail(
  user: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  verifiedLoginEmail?: string,
): string | null {
  const candidates = [
    verifiedLoginEmail,
    user.email,
    user.user_metadata?.email,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return normalizeEmail(candidate);
    }
  }

  return null;
}

/** Parsed from ADMIN_EMAILS (comma-separated). Strips quotes Coolify/Docker often add. */
export function normalizeEmailForAuth(email: string): string {
  return normalizeEmail(email);
}

export function getAdminAllowlistEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";

  return raw
    .split(/[,;]/)
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isEmailInAdminAllowlist(email: string): boolean {
  const normalized = normalizeEmail(email);
  return getAdminAllowlistEmails().includes(normalized);
}
