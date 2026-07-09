import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendNewOrderNotification, sendCartConfirmation } from "@/lib/email";
import { getProductBySlug, decrementStock } from "@/lib/products";
import { getPlanById } from "@/lib/plans";
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
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://oubliejamaisbijoux.fr";

    const buyerEmail =
      session.customer_email ??
      (session.customer_details as { email?: string } | null)?.email ??
      null;

    if (meta.orderId) {
      // Commande panier — plusieurs articles partageant un orderId, créés
      // (non payés) avant le paiement. On les bascule en payés puis on notifie.
      await prisma.message.updateMany({
        where: { orderId: meta.orderId },
        data: { paid: true, stripeSessionId: session.id },
      });

      const orderItems = await prisma.message.findMany({
        where: { orderId: meta.orderId },
        orderBy: { createdAt: "asc" },
      });

      // Décrément du stock : une unité par article, regroupé par produit.
      const qtyBySlug = new Map<string, number>();
      for (const m of orderItems) {
        if (m.productSlug) qtyBySlug.set(m.productSlug, (qtyBySlug.get(m.productSlug) ?? 0) + 1);
      }
      for (const [slug, qty] of qtyBySlug) {
        try { await decrementStock(slug, qty); } catch (err) { console.error("[webhook] stock decrement failed", err); }
      }

      if (orderItems.length > 0) {
        const to = orderItems[0].buyerEmail ?? buyerEmail;
        if (to) {
          try {
            await sendCartConfirmation({
              to,
              origin,
              items: orderItems.map((m) => ({
                toName: m.toName,
                productName: m.productName ?? "Bijou N'OUBLIE JAMAIS",
                slug: m.slug,
                accessCode: m.accessCode ?? undefined,
              })),
            });
          } catch (err) {
            console.error("[webhook] Cart confirmation email failed", err);
          }
        }
        // Notification vendeur : une par commande, récapitulant le nombre d'articles.
        try {
          const first = orderItems[0];
          const total = (session.amount_total ?? 0) / 100;
          await sendNewOrderNotification({
            fromName: `${orderItems.length} article${orderItems.length > 1 ? "s" : ""}`,
            toName: orderItems.map((m) => m.toName).join(", "),
            buyerEmail: to,
            productLabel: orderItems.map((m) => m.productName).filter(Boolean).join(" · "),
            price: total,
            shipName: first.shipName,
            shipAddress: first.shipAddress,
            shipComplement: first.shipComplement,
            shipPostalCode: first.shipPostalCode,
            shipCity: first.shipCity,
            shipCountry: first.shipCountry,
            adminUrl: `${origin}/admin`,
          });
        } catch (err) {
          console.error("[webhook] Vendor notification (cart) failed", err);
        }
      }
    } else if (meta.slug && meta.fromName && meta.toName && meta.audioUrl) {
      const purchasedProduct = meta.productSlug ? await getProductBySlug(meta.productSlug) : undefined;

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
          productName: purchasedProduct?.name ?? null,
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

      // Décrément du stock (une unité) pour l'achat unique.
      if (meta.productSlug) {
        try { await decrementStock(meta.productSlug, 1); } catch (err) { console.error("[webhook] stock decrement failed", err); }
      }

      // Send confirmation email (acheteur)
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
            productName: purchasedProduct?.name,
            shipped: !!(meta.shipAddress || meta.shipCity),
          });
        } catch (err) {
          console.error("[webhook] Email send failed", err);
        }
      }

      // Notification au vendeur — nouvelle vente en ligne
      try {
        const price = purchasedProduct?.price ?? getPlanById(meta.planId)?.price ?? 0;
        await sendNewOrderNotification({
          fromName: meta.fromName,
          toName: meta.toName,
          buyerEmail,
          productLabel: purchasedProduct?.name ?? meta.planId ?? "Commande",
          price,
          shipName: meta.shipName,
          shipAddress: meta.shipAddress,
          shipComplement: meta.shipComplement,
          shipPostalCode: meta.shipPostalCode,
          shipCity: meta.shipCity,
          shipCountry: meta.shipCountry,
          adminUrl: `${origin}/admin`,
        });
      } catch (err) {
        console.error("[webhook] Vendor notification failed", err);
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
