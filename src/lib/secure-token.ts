import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const secret = process.env.SESSION_TOKEN_SECRET;

  if (!secret) {
    throw new Error("Missing SESSION_TOKEN_SECRET environment variable");
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSignedToken(payload: string): string {
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(payload)}`;
}

export function verifySignedToken(
  token: string,
  expectedPayload: string,
): boolean {
  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return false;
  }

  const payload = Buffer.from(encoded, "base64url").toString("utf8");

  if (payload !== expectedPayload) {
    return false;
  }

  return safeEqual(signature, sign(payload));
}
