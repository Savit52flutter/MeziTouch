function normalizeEmail(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "").toLowerCase();
}

/** Parsed from ADMIN_EMAILS (comma-separated). Strips quotes Coolify/Docker often add. */
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
