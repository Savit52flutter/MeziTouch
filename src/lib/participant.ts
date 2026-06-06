import { customAlphabet } from "nanoid";

const generateId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 16);

const STORAGE_KEY = "mezitouch_participant_id";

export function getParticipantId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const id = generateId();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
