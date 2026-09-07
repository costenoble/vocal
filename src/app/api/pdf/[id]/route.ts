import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { registerCardFonts } from "@/lib/pdf/fonts";
import { CardDocument } from "@/lib/pdf/CardDocument";

let logoDataUrl: string | null = null;
function getLogoDataUrl() {
  if (!logoDataUrl) {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/logo.png"));
    logoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return logoDataUrl;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const message = await prisma.message.findUnique({ where: { slug: id } });

  if (!message) {
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }

  // URL canonique pour le QR code imprimé — jamais depuis un header spoofable.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || "http://localhost:3000";
  const listenUrl = `${baseUrl}/listen/${message.slug}`;

  const qrDataUrl = await QRCode.toDataURL(listenUrl, {
    width: 600,
    margin: 1,
    color: { dark: "#1C1410", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });

  registerCardFonts();

  const pdfBuffer = await renderToBuffer(
    CardDocument({
      data: {
        slug: message.slug,
        fromName: message.fromName,
        toName: message.toName,
        message: message.message,
        accessCode: message.accessCode,
        paper: message.paper,
        cardFont: message.cardFont,
        createdAt: message.createdAt,
        logoDataUrl: getLogoDataUrl(),
        qrDataUrl,
      },
    })
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="carte-nj-${message.slug}.pdf"`,
    },
  });
}
