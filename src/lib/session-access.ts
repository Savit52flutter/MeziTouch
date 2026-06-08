const TOKEN_PREFIX = "mezitouch_session_token_";
const PENDING_PASSWORD_PREFIX = "mezitouch_pending_password_";

function storageKey(code: string): string {
  return `${TOKEN_PREFIX}${code.toUpperCase()}`;
}

export function storeSessionAccessToken(code: string, token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(storageKey(code), token);
}

export function getStoredSessionAccessToken(code: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(storageKey(code));
}

export function clearStoredSessionAccessToken(code: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(storageKey(code));
}

export function storePendingSessionPassword(code: string, digits: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(
    `${PENDING_PASSWORD_PREFIX}${code.toUpperCase()}`,
    digits,
  );
}

export function consumePendingSessionPassword(code: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = `${PENDING_PASSWORD_PREFIX}${code.toUpperCase()}`;
  const value = sessionStorage.getItem(key);

  if (value) {
    sessionStorage.removeItem(key);
  }

  return value;
}

export function sessionAccessHeaders(code: string): HeadersInit {
  const token = getStoredSessionAccessToken(code);

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
