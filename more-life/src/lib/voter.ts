import { createHash, randomUUID } from "crypto";
import { cookies, headers } from "next/headers";

const COOKIE = "ml_vid";

function secret(): string {
  const s = process.env.APP_SECRET;
  if (!s) throw new Error("APP_SECRET is not set");
  return s;
}

/**
 * Anonymous stable per-browser id: a first-party cookie holding a random UUID,
 * hashed server-side with a secret salt. No accounts, no PII, no third-party
 * tracking. The raw cookie value never reaches the database.
 */
export async function getVoterHash(): Promise<string> {
  const jar = await cookies();
  let vid = jar.get(COOKIE)?.value;
  if (!vid || !/^[0-9a-f-]{36}$/.test(vid)) {
    vid = randomUUID();
    jar.set(COOKIE, vid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365 * 2,
      path: "/",
    });
  }
  return createHash("sha256").update(`${secret()}:voter:${vid}`).digest("hex");
}

export async function getUserAgentClass(): Promise<"mobile" | "desktop"> {
  const ua = (await headers()).get("user-agent") ?? "";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop";
}
