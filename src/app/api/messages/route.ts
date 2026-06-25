import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { getPlanById, getExpiresAt } from "@/lib/plans";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromName, toName, date, audioPath, audioUrl, duration, stripeSessionId } = body;

    if (!fromName || !toName || !date || !(audioPath || audioUrl)) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Verify payment
    let planId = "precieux";
    let buyerEmail: string | null = null;
    let paid = false;

    if (stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Paiement non confirmé" }, { status: 402 });
      }
      paid = true;
      planId = (session.metadata?.planId as string) || "precieux";
      buyerEmail = session.customer_email;
    }

    const plan = getPlanById(planId);
    const expiresAt = plan ? getExpiresAt(plan) : null;
    const slug = nanoid(10);
    const finalAudioUrl = audioUrl || audioPath;

    const message = await prisma.message.create({
      data: {
        slug,
        fromName: fromName.trim(),
        toName: toName.trim(),
        date,
        audioUrl: finalAudioUrl,
        duration: duration ? Math.round(duration) : null,
        plan: planId,
        paid,
        stripeSessionId: stripeSessionId || null,
        buyerEmail,
        expiresAt,
      },
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const listenUrl = `${origin}/listen/${slug}`;
    const pdfUrl = `${origin}/api/pdf/${slug}`;

    // Send confirmation email (non-blocking)
    if (buyerEmail) {
      sendOrderConfirmation({
        to: buyerEmail,
        fromName: fromName.trim(),
        toName: toName.trim(),
        listenUrl,
        pdfUrl,
        plan: plan?.name ?? planId,
      }).catch(console.error);
    }

    return NextResponse.json({ message, listenUrl, slug, pdfUrl });
  } catch (err) {
    console.error("[messages POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug manquant" }, { status: 400 });
  const message = await prisma.message.findUnique({ where: { slug } });
  if (!message) return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  return NextResponse.json(message);
}
