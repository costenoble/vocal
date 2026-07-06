import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSessionToken, isValidAdminLogin, ADMIN_COOKIE } from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Derrière le proxy Hostinger, req.url reflète parfois l'adresse interne
// du serveur (0.0.0.0:3000) plutôt que le domaine public — on construit
// donc les redirections depuis une base de confiance, jamais depuis req.url.
function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://oubliejamaisbijoux.fr";
}

export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`admin-login:${clientIp(req)}`, 5, 60_000);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin?error=ratelimit", siteOrigin()), 303);
  }

  const form = await req.formData();
  const user = String(form.get("user") ?? "");
  const password = String(form.get("password") ?? "");

  if (!isValidAdminLogin(user, password)) {
    return NextResponse.redirect(new URL("/admin?error=1", siteOrigin()), 303);
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, adminSessionToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });

  return NextResponse.redirect(new URL("/admin", siteOrigin()), 303);
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
