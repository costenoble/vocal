import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// QR code haute résolution (1240×1240) avec le logo au centre — à imprimer,
// graver ou coller ailleurs que sur la carte fournie.
// ?download=1 force le téléchargement du fichier.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const message = await prisma.message.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const listenUrl = `${baseUrl}/listen/${message.slug}`;

  // Niveau de correction H (30 %) : le logo au centre ne gêne pas la lecture.
  const qrDataUrl = await QRCode.toDataURL(listenUrl, {
    width: 1000,
    margin: 0,
    color: { dark: "#1C1410", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });

  const image = new ImageResponse(
    (
      <div
        style={{
          width: 1240,
          height: 1240,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          position: "relative",
        }}
      >
        {/* Cadre doré fin */}
        <div
          style={{
            position: "absolute",
            inset: 36,
            border: "3px solid rgba(184,134,26,0.55)",
            borderRadius: 40,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 50,
            border: "1.5px solid rgba(184,134,26,0.25)",
            borderRadius: 30,
          }}
        />

        {/* QR */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} width={940} height={940} alt="" />

        {/* Pastille logo au centre */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 216,
            height: 216,
            borderRadius: 999,
            background: "#FFFFFF",
            border: "3px solid rgba(184,134,26,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${baseUrl}/logo.png`} width={168} height={167} alt="" />
        </div>

        {/* Marque en bas */}
        <div
          style={{
            position: "absolute",
            bottom: 74,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "0.3em", color: "#1C1410", fontFamily: "sans-serif" }}>
            N&apos;OUBLIE JAMAIS
          </span>
          <span style={{ fontSize: 15, letterSpacing: "0.24em", color: "#B8861A", fontFamily: "sans-serif" }}>
            SCANNEZ POUR ÉCOUTER
          </span>
        </div>
      </div>
    ),
    { width: 1240, height: 1240 }
  );

  if (req.nextUrl.searchParams.get("download") === "1") {
    const headers = new Headers(image.headers);
    headers.set("Content-Disposition", `attachment; filename="qr-noubliejamais-${message.slug}.png"`);
    return new Response(image.body, { status: 200, headers });
  }
  return image;
}
