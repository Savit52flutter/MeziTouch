import { cookies } from "next/headers";

import { createSignedToken, verifySignedToken } from "./secure-token";

const COOKIE_PREFIX = "mezitouch_session_";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sessionPayload(sessionId: string, code: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  return `${sessionId}:${code.toUpperCase()}:${expiresAt}`;
}

function sessionCookieName(code: string): string {
  return `${COOKIE_PREFIX}${code.toUpperCase()}`;
}

export function createSessionAccessToken(
  sessionId: string,
  code: string,
): string {
  return createSignedToken(sessionPayload(sessionId, code));
}

export function verifySessionAccessToken(
  token: string,
  sessionId: string,
  code: string,
): boolean {
  const [encoded] = token.split(".");

  if (!encoded) {
    return false;
  }

  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const [id, sessionCode, expiresAt] = payload.split(":");

  if (!id || !sessionCode || !expiresAt) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  return (
    id === sessionId &&
    sessionCode === code.toUpperCase() &&
    verifySignedToken(token, payload)
  );
}

export async function getSessionAccessToken(
  code: string,
): Promise<string | null> {
  const store = await cookies();
  return store.get(sessionCookieName(code))?.value ?? null;
}

function getBearerSessionToken(request?: Request): string | null {
  if (!request) {
    return null;
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function resolveSessionAccessToken(
  code: string,
  request?: Request,
): Promise<string | null> {
  const cookieToken = await getSessionAccessToken(code);

  if (cookieToken) {
    return cookieToken;
  }

  return getBearerSessionToken(request);
}

export async function setSessionAccessCookie(
  sessionId: string,
  code: string,
): Promise<string> {
  const token = createSessionAccessToken(sessionId, code);
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName(code), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });

  return token;
}

export async function hasValidSessionAccess(
  sessionId: string,
  code: string,
  request?: Request,
): Promise<boolean> {
  const token = await resolveSessionAccessToken(code, request);

  if (!token) {
    return false;
  }

  return verifySessionAccessToken(token, sessionId, code);
}
