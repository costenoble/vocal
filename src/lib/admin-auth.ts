import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "nj_admin";

// Identifiants : ADMIN_USER (défaut "admin") + ADMIN_PASSWORD.
// ADMIN_KEY est accepté comme mot de passe en fallback (compat).
function adminUser(): string {
  return process.env.ADMIN_USER ?? "admin";
}

function adminSecret(): string | null {
  return process.env.ADMIN_PASSWORD ?? process.env.ADMIN_KEY ?? null;
}

// Le jeton de session est dérivé du mot de passe : impossible à forger sans
// lui, et invalidé automatiquement s'il est changé.
export function adminSessionToken(): string | null {
  const secret = adminSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update("nj-admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function isValidAdminLogin(user: string, password: string): boolean {
  const secret = adminSecret();
  if (!secret || !user || !password) return false;
  return safeEqual(user, adminUser()) && safeEqual(password, secret);
}

export async function isAdminSession(): Promise<boolean> {
  const expected = adminSessionToken();
  if (!expected) return false;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return !!token && safeEqual(token, expected);
}
