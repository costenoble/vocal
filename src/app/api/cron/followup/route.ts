import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFollowupEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Appelé chaque matin par le cron Vercel (vercel.json). Envoie l'email
// "votre proche a-t-il écouté ?" aux acheteurs 3 jours après la commande,
// une seule fois par carte.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const due = await prisma.message.findMany({
    where: {
      paid: true,
      buyerEmail: { not: null },
      followupSentAt: null,
      createdAt: { lte: threeDaysAgo, gte: thirtyDaysAgo },
    },
    select: { slug: true, buyerEmail: true, toName: true, viewCount: true },
    take: 50,
  });

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let sent = 0;

  for (const m of due) {
    try {
      await sendFollowupEmail({
        to: m.buyerEmail!,
        toName: m.toName,
        listenUrl: `${origin}/listen/${m.slug}`,
        viewCount: m.viewCount,
      });
      await prisma.message.update({
        where: { slug: m.slug },
        data: { followupSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`[cron/followup] échec pour ${m.slug}`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, pending: due.length - sent });
}
