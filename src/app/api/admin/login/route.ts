import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSessionToken, isValidAdminKey, ADMIN_COOKIE } from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`admin-login:${clientIp(req)}`, 5, 60_000);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin?error=ratelimit", req.url), 303);
  }

  const form = await req.formData();
  const key = String(form.get("key") ?? "");

  if (!isValidAdminKey(key)) {
    return NextResponse.redirect(new URL("/admin?error=1", req.url), 303);
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, adminSessionToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });

  return NextResponse.redirect(new URL("/admin", req.url), 303);
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
