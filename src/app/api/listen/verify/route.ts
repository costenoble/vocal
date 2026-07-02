import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Verifies the private access code before releasing the audio.
// The audioUrl is never sent to the client until the code matches.
export async function POST(req: NextRequest) {
  try {
    const { slug, code } = await req.json();
    if (!slug || !code) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    // Anti brute-force : le code n'a que 6 chiffres, on limite strictement
    // les tentatives par IP et par carte.
    const ip = clientIp(req);
    const byIp = rateLimit(`verify-ip:${ip}`, 10, 60_000);
    const bySlug = rateLimit(`verify-slug:${slug}`, 20, 60_000);
    if (!byIp.ok || !bySlug.ok) {
      const retry = Math.max(byIp.retryAfterSeconds, bySlug.retryAfterSeconds);
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une minute." },
        { status: 429, headers: { "Retry-After": String(retry) } }
      );
    }

    const message = await prisma.message.findUnique({
      where: { slug: String(slug) },
      select: { accessCode: true, audioUrl: true, message: true, duration: true, expiresAt: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    const expired = message.expiresAt ? new Date() > new Date(message.expiresAt) : false;
    if (expired) {
      return NextResponse.json({ error: "expired" }, { status: 410 });
    }

    if (!message.accessCode || String(code).trim() !== message.accessCode) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      audioUrl: message.audioUrl,
      message: message.message ?? null,
      duration: message.duration ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
