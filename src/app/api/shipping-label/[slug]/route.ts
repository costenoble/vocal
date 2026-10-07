import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin-auth";
import { registerCardFonts } from "@/lib/pdf/fonts";
import { ShippingLabelDocument } from "@/lib/pdf/ShippingLabelDocument";

export const dynamic = "force-dynamic";

// Étiquette d'expédition 10x15cm (imprimante thermique), réservée à l'admin.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const m = await prisma.message.findUnique({
    where: { slug },
    select: {
      shipName: true,
      shipAddress: true,
      shipComplement: true,
      shipPostalCode: true,
      shipCity: true,
      shipCountry: true,
    },
  });
  if (!m) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  registerCardFonts();
  const pdfBuffer = await renderToBuffer(ShippingLabelDocument({ data: m }));

  const disposition = req.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="etiquette-${slug}.pdf"`,
    },
  });
}
