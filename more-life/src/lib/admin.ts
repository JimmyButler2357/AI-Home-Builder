import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ml_admin";

function token(): string {
  const secret = process.env.APP_SECRET ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret).update(`admin:${password}`).digest("base64url");
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.APP_SECRET);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const got = (await cookies()).get(COOKIE)?.value ?? "";
  const want = token();
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(process.env.ADMIN_PASSWORD!);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/admin",
  });
  return true;
}
