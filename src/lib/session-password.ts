import { customAlphabet } from "nanoid";

const generateDigits = customAlphabet("0123456789", 6);

export const SESSION_PASSWORD_PREFIX = "MT";
export const SESSION_PASSWORD_DIGITS = 6;
export const SESSION_PASSWORD_LENGTH =
  SESSION_PASSWORD_PREFIX.length + SESSION_PASSWORD_DIGITS;

const SESSION_PASSWORD_PATTERN = new RegExp(
  `^${SESSION_PASSWORD_PREFIX}\\d{${SESSION_PASSWORD_DIGITS}}$`,
);

export function createSessionPassword(): string {
  return `${SESSION_PASSWORD_PREFIX}${generateDigits()}`;
}

export function normalizeSessionPassword(input: string): string {
  const trimmed = input.trim().toUpperCase();

  if (trimmed.startsWith(SESSION_PASSWORD_PREFIX)) {
    return trimmed.slice(0, SESSION_PASSWORD_LENGTH);
  }

  const digits = trimmed.replace(/\D/g, "").slice(0, SESSION_PASSWORD_DIGITS);
  return `${SESSION_PASSWORD_PREFIX}${digits}`;
}

export function isValidSessionPasswordFormat(password: string): boolean {
  return SESSION_PASSWORD_PATTERN.test(password);
}

export function sessionPasswordHint(): string {
  return `${SESSION_PASSWORD_PREFIX} + ${SESSION_PASSWORD_DIGITS} digits (e.g. ${SESSION_PASSWORD_PREFIX}123456)`;
}
