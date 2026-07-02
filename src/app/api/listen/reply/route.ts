import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReplyNotification } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Seuls les fichiers hébergés sur notre Vercel Blob sont acceptés : impossible
// de faire pointer une "réponse" vers un contenu arbitraire.
function isOwnBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      (u.hostname.endsWith(".public.blob.vercel-storage.com") ||
        u.hostname.endsWith(".vercel-blob.com")) &&
      u.pathname.startsWith("/audio/")
    );
  } catch {
    return false;
  }
}

// Le destinataire répond par un message vocal ; l'acheteur est prévenu par email.
export async function POST(req: NextRequest) {
  try {
    const { slug, code, fromName, audioUrl } = await req.json();

    if (!slug || !audioUrl) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const { ok } = rateLimit(`reply:${clientIp(req)}`, 5, 60 * 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Trop de réponses envoyées. Réessayez plus tard." }, { status: 429 });
    }

    if (!isOwnBlobUrl(String(audioUrl))) {
      return NextResponse.json({ error: "Audio invalide" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: { slug: String(slug) },
      select: { slug: true, accessCode: true, expiresAt: true, buyerEmail: true, fromName: true, toName: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }
    if (message.expiresAt && new Date() > new Date(message.expiresAt)) {
      return NextResponse.json({ error: "expired" }, { status: 410 });
    }
    // Même verrou que l'écoute : le code de la carte est requis pour répondre.
    if (message.accessCode && String(code ?? "").trim() !== message.accessCode) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
    }

    const replierName = String(fromName ?? "").trim().slice(0, 60) || message.toName;

    await prisma.message.update({
      where: { slug: message.slug },
      data: {
        replyAudioUrl: String(audioUrl),
        replyFromName: replierName,
        replyAt: new Date(),
      },
    });

    if (message.buyerEmail) {
      const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      sendReplyNotification({
        to: message.buyerEmail,
        replierName,
        toName: message.toName,
        listenUrl: `${origin}/listen/${message.slug}`,
      }).catch((err) => console.error("[reply] email failed", err));
    }

    return NextResponse.json({ ok: true, replyFromName: replierName });
  } catch (err) {
    console.error("[listen/reply]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
