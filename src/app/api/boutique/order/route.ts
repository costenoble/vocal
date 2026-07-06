import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products";
import { sendOrderConfirmation } from "@/lib/email";
import { isAdminSession } from "@/lib/admin-auth";
import { nanoid, customAlphabet } from "nanoid";

export const dynamic = "force-dynamic";

const genAccessCode = customAlphabet("0123456789", 6);

// Boutique mode: a vendor creates a paid order directly (payment taken at the
// register), bypassing Stripe. Protected by the admin session cookie.
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { fromName, toName, date, audioUrl, theme, paper, cardFont, message, productSlug, productSize, shipping, buyerEmail } = body;
    if (!fromName || !toName || !audioUrl) {
      return NextResponse.json({ error: "Champs manquants (prénoms + audio requis)" }, { status: 400 });
    }

    const product = productSlug ? await getProductBySlug(productSlug) : undefined;
    const slug = nanoid(8);
    const accessCode = genAccessCode();

    await prisma.message.create({
      data: {
        slug,
        fromName,
        toName,
        date: date || "",
        audioUrl,
        theme: theme || "classique",
        paper: paper || "ivoire",
        cardFont: cardFont || "playfair",
        message: message || null,
        plan: product ? "bracelet" : "carte",
        source: "boutique",
        accessCode,
        productSlug: product?.slug ?? null,
        productName: product?.name ?? null,
        productSize: productSize || null,
        shipName: shipping?.fullName || null,
        shipAddress: shipping?.address || null,
        shipComplement: shipping?.complement || null,
        shipPostalCode: shipping?.postalCode || null,
        shipCity: shipping?.city || null,
        shipCountry: shipping?.country || null,
        paid: true,
        viewCount: 0,
      },
    });

    // Optional confirmation email if the vendor entered the buyer's address
    if (buyerEmail) {
      const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      try {
        await sendOrderConfirmation({
          to: buyerEmail,
          fromName,
          toName,
          listenUrl: `${origin}/listen/${slug}`,
          pdfUrl: `${origin}/api/pdf/${slug}`,
          plan: product ? "bracelet" : "carte",
          accessCode,
          productName: product?.name,
          shipped: !!(shipping?.address || shipping?.city),
        });
      } catch (err) {
        console.error("[boutique/order] email failed", err);
      }
    }

    return NextResponse.json({ ok: true, slug, accessCode });
  } catch (err) {
    console.error("[boutique/order]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
