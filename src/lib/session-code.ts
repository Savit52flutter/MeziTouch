import { customAlphabet } from "nanoid";

const SESSION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCode = customAlphabet(SESSION_CODE_ALPHABET, 6);

export const SESSION_CODE_LENGTH = 6;

export function createSessionCode(): string {
  return generateCode();
}

export function normalizeSessionCodeInput(input: string): string {
  const pattern = new RegExp(`[^${SESSION_CODE_ALPHABET}]`, "gi");
  return input.toUpperCase().replace(pattern, "").slice(0, SESSION_CODE_LENGTH);
}
