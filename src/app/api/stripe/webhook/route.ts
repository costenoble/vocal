import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import { getProductBySlug } from "@/lib/products";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[webhook] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://noubliejamais.fr";

    const buyerEmail =
      session.customer_email ??
      (session.customer_details as { email?: string } | null)?.email ??
      null;

    if (meta.slug && meta.fromName && meta.toName && meta.audioUrl) {
      // Composer flow — create Message record directly from metadata.
      // Shipping address is collected in the composer (step 5) and passed via metadata.
      await prisma.message.upsert({
        where: { slug: meta.slug },
        create: {
          slug: meta.slug,
          fromName: meta.fromName,
          toName: meta.toName,
          date: meta.date || "",
          audioUrl: meta.audioUrl,
          plan: meta.planId || "bracelet",
          theme: meta.theme || "classique",
          paper: meta.paper || "ivoire",
          cardFont: meta.cardFont || "playfair",
          message: meta.message || null,
          accessCode: meta.accessCode || null,
          productSlug: meta.productSlug || null,
          productName: meta.productSlug ? getProductBySlug(meta.productSlug)?.name ?? null : null,
          productSize: meta.productSize || null,
          shipName: meta.shipName || null,
          shipAddress: meta.shipAddress || null,
          shipComplement: meta.shipComplement || null,
          shipPostalCode: meta.shipPostalCode || null,
          shipCity: meta.shipCity || null,
          shipCountry: meta.shipCountry || null,
          paid: true,
          stripeSessionId: session.id,
          buyerEmail,
          viewCount: 0,
        },
        update: { paid: true },
      });

      // Send confirmation email
      if (buyerEmail) {
        try {
          await sendOrderConfirmation({
            to: buyerEmail,
            fromName: meta.fromName,
            toName: meta.toName,
            listenUrl: `${origin}/listen/${meta.slug}`,
            pdfUrl: `${origin}/api/pdf/${meta.slug}`,
            plan: meta.planId || "bracelet",
            accessCode: meta.accessCode || undefined,
          });
        } catch (err) {
          console.error("[webhook] Email send failed", err);
        }
      }
    } else if (session.id) {
      // Legacy flow — mark existing pre-created record as paid
      await prisma.message.updateMany({
        where: { stripeSessionId: session.id },
        data: { paid: true },
      });
    }
  }

  return NextResponse.json({ received: true });
}
