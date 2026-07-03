import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Formulaire de contact (overlay du footer). Chaque message est enregistré en
// base (aucune perte même si l'envoi d'email échoue), puis notifié par email.
export async function POST(req: NextRequest) {
  try {
    const { ok } = rateLimit(`contact:${clientIp(req)}`, 3, 60 * 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Trop de messages envoyés. Réessayez dans une heure." }, { status: 429 });
    }

    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 120);
    const subject = String(body.subject ?? "").trim().slice(0, 120) || "Autre";
    const message = String(body.message ?? "").trim().slice(0, 3000);

    if (!name || !message || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Vérifiez votre nom, votre email et votre message." }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Notification email — best effort, le message est déjà en base.
    sendContactNotification({ name, email, subject, message }).catch((err) =>
      console.error("[contact] email failed", err)
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
