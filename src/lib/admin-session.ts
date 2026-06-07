const STORAGE_KEY = "mezitouch_admin_access_token";

export function storeAdminAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, token);
}

export function getStoredAdminAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearAdminAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
}

export function adminAuthHeaders(): HeadersInit {
  const token = getStoredAdminAccessToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
