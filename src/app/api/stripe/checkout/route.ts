import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlanById } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Not paid" }, { status: 402 });
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { planId, email } = await req.json();

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(plan.price * 100),
            product_data: {
              name: `N'OUBLIE JAMAIS — ${plan.name}`,
              description: plan.tagline,
              images: [`${origin}/og-default.png`],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        planId,
        cardCount: plan.cardCount,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
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
