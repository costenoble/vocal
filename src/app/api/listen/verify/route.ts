import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Verifies the private access code before releasing the audio.
// The audioUrl is never sent to the client until the code matches.
export async function POST(req: NextRequest) {
  try {
    const { slug, code } = await req.json();
    if (!slug || !code) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
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
