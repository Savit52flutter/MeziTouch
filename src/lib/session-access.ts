const TOKEN_PREFIX = "mezitouch_session_token_";

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

export function sessionAccessHeaders(code: string): HeadersInit {
  const token = getStoredSessionAccessToken(code);

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
