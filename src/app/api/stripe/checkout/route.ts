import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlanById } from "@/lib/plans";
import { getProductBySlug } from "@/lib/products";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { nanoid, customAlphabet } from "nanoid";

// 6-digit numeric access code (no ambiguous chars) printed on the card
const genAccessCode = customAlphabet("0123456789", 6);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      return NextResponse.json({ ok: true, slug: session.metadata?.slug ?? null });
    }
    return NextResponse.json({ error: "Not paid" }, { status: 402 });
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ok } = rateLimit(`checkout:${clientIp(req)}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Trop de requêtes. Réessayez dans une minute." }, { status: 429 });
    }

    const body = await req.json();
    const { planId, productSlug, productSize, email, fromName, toName, date, occasion, audioUrl, theme, paper, cardFont, message, shipping } = body;

    // Two pricing paths: a physical product (bracelet) or a legacy card plan.
    const product = productSlug ? getProductBySlug(productSlug) : undefined;
    const plan = product ? undefined : getPlanById(planId);

    if (!product && !plan) {
      return NextResponse.json({ error: "Produit ou formule invalide" }, { status: 400 });
    }

    const lineName = product ? product.name : `N'OUBLIE JAMAIS — ${plan!.name}`;
    const lineDesc = product
      ? `Taille ${productSize || "unique"} · Carte vocale incluse`
      : plan!.tagline;
    const unitPrice = product ? product.price : plan!.price;

    // On ne fait pas confiance au header Origin (spoofable) pour les URLs de
    // redirection Stripe : l'URL canonique vient de l'environnement.
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Pre-generate slug + access code so the webbook can persist them immediately.
    const slug = nanoid(8);
    const accessCode = genAccessCode();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name: lineName,
              description: lineDesc,
              // Stripe exige une URL publique https — pas d'image en local.
              ...(origin.startsWith("https")
                ? { images: [`${origin}/og-default.png`] }
                : {}),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        planId: plan?.id ?? "bracelet",
        productSlug: product?.slug ?? "",
        productSize: productSize ?? "",
        accessCode,
        slug,
        fromName: fromName ?? "",
        toName: toName ?? "",
        date: date ?? "",
        occasion: occasion ?? "",
        audioUrl: audioUrl ?? "",
        theme: theme ?? "classique",
        paper: paper ?? "ivoire",
        cardFont: cardFont ?? "playfair",
        message: (message ?? "").slice(0, 480),
        shipName: shipping?.fullName ?? "",
        shipAddress: shipping?.address ?? "",
        shipComplement: shipping?.complement ?? "",
        shipPostalCode: shipping?.postalCode ?? "",
        shipCity: shipping?.city ?? "",
        shipCountry: shipping?.country ?? "",
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/composer`,
      payment_method_types: ["card"],
      locale: "fr",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}
