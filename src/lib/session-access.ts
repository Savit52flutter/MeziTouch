const STORAGE_PREFIX = "mezitouch_access_";

export function hasSessionAccess(code: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(`${STORAGE_PREFIX}${code.toUpperCase()}`) === "1";
}

export function grantSessionAccess(code: string): void {
  sessionStorage.setItem(`${STORAGE_PREFIX}${code.toUpperCase()}`, "1");
}
