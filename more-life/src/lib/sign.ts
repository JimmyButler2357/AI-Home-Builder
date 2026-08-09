import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  const s = process.env.APP_SECRET;
  if (!s) throw new Error("APP_SECRET is not set");
  return s;
}

function hmac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * Signed pair tokens: /api/pair issues one per served pair; /api/vote only
 * accepts votes for pairs the server actually served. Prevents fabricated
 * votes on arbitrary item pairs.
 */
export type PairPayload = {
  a: string; // left item id (as displayed)
  b: string; // right item id (as displayed)
  category: string;
  pool: string;
  variant: "life" | "beauty";
  nonce: string; // idempotency key: retries of the same vote insert once
  iat: number; // seconds
};

export function signPair(p: PairPayload): string {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

const MAX_AGE_S = 60 * 60 * 6;

export function verifyPair(token: string): PairPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const want = hmac(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as PairPayload;
    if (typeof p.a !== "string" || typeof p.b !== "string" || p.a === p.b) return null;
    if (p.variant !== "life" && p.variant !== "beauty") return null;
    if (!Number.isFinite(p.iat) || Date.now() / 1000 - p.iat > MAX_AGE_S) return null;
    return p;
  } catch {
    return null;
  }
}
