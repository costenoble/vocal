import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "nj_admin";

// Le jeton de session est dérivé de ADMIN_KEY : impossible à forger sans la
// clé, et invalidé automatiquement si la clé est changée.
export function adminSessionToken(): string | null {
  const key = process.env.ADMIN_KEY;
  if (!key) return null;
  return createHmac("sha256", key).update("nj-admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function isValidAdminKey(candidate: string): boolean {
  const key = process.env.ADMIN_KEY;
  if (!key || !candidate) return false;
  return safeEqual(candidate, key);
}

export async function isAdminSession(): Promise<boolean> {
  const expected = adminSessionToken();
  if (!expected) return false;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return !!token && safeEqual(token, expected);
}
