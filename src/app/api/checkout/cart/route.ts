import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products";
import { audioPublicPrefix } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { nanoid, customAlphabet } from "nanoid";

export const dynamic = "force-dynamic";

const genAccessCode = customAlphabet("0123456789", 6);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface IncomingItem {
  productSlug: string;
  productSize?: string;
  fromName?: string;
  toName?: string;
  date?: string;
  theme?: string;
  paper?: string;
  cardFont?: string;
  message?: string;
  audioUrl?: string;
}

function isOwnAudio(url: string): boolean {
  const prefix = audioPublicPrefix();
  return !!prefix && typeof url === "string" && url.startsWith(prefix);
}

export async function POST(req: NextRequest) {
  try {
    const { ok } = rateLimit(`cart-checkout:${clientIp(req)}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Trop de requêtes. Réessayez dans une minute." }, { status: 429 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const shipping = body.shipping ?? {};
    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }
    if (items.length > 20) {
      return NextResponse.json({ error: "Trop d'articles dans le panier" }, { status: 400 });
    }
    if (!shipping.fullName || !shipping.address || !shipping.postalCode || !shipping.city || !shipping.country) {
      return NextResponse.json({ error: "Adresse de livraison incomplète" }, { status: 400 });
    }

    // Résolution + validation de chaque article côté serveur (prix de confiance).
    const resolved = [];
    for (const it of items) {
      const product = it.productSlug ? await getProductBySlug(it.productSlug) : undefined;
      if (!product || !product.active) {
        return NextResponse.json({ error: "Un article n'est plus disponible" }, { status: 400 });
      }
      if (!it.fromName || !it.toName || !it.audioUrl || !isOwnAudio(it.audioUrl)) {
        return NextResponse.json({ error: "Un article est incomplet" }, { status: 400 });
      }
      resolved.push({ it, product });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const orderId = nanoid(12);

    // Création des enregistrements (non payés) partageant le même orderId.
    // Le webhook les basculera en payés après confirmation Stripe.
    await prisma.message.createMany({
      data: resolved.map(({ it, product }) => ({
        slug: nanoid(8),
        orderId,
        fromName: (it.fromName || "").trim(),
        toName: (it.toName || "").trim(),
        date: it.date || "",
        audioUrl: it.audioUrl!,
        plan: "bracelet",
        theme: it.theme || "classique",
        paper: it.paper || "ivoire",
        cardFont: it.cardFont || "playfair",
        message: (it.message || "").slice(0, 480) || null,
        accessCode: genAccessCode(),
        productSlug: product.slug,
        productName: product.name,
        productSize: it.productSize || null,
        shipName: shipping.fullName || null,
        shipAddress: shipping.address || null,
        shipComplement: shipping.complement || null,
        shipPostalCode: shipping.postalCode || null,
        shipCity: shipping.city || null,
        shipCountry: shipping.country || null,
        buyerEmail: email,
        paid: false,
        viewCount: 0,
      })),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: resolved.map(({ product, it }) => ({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name,
            description: `${it.productSize ? `Taille ${it.productSize} · ` : ""}Pour ${it.toName}`,
            ...(origin.startsWith("https") ? { images: [`${origin}/og-default.png`] } : {}),
          },
        },
        quantity: 1,
      })),
      metadata: { orderId, kind: "cart" },
      success_url: `${origin}/success?order=${orderId}`,
      cancel_url: `${origin}/panier`,
      payment_method_types: ["card"],
      locale: "fr",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, orderId });
  } catch (err) {
    console.error("[checkout/cart]", err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}
