import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await prisma.message.findUnique({ where: { slug: id } });

  const fromName = message?.fromName ?? "Sophie";
  const toName = message?.toName ?? "Maman";
  // Texte libre affiché tel quel ; seul l'ancien format ISO est reformaté.
  const date = (() => {
    if (!message?.date) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(message.date)) {
      const d = new Date(message.date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      }
    }
    return message.date;
  })();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6EF",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(184,134,26,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Gold top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(to right, #8B6510, #D4A832, #8B6510)",
          }}
        />

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            padding: "56px 64px",
            background: "rgba(255,255,255,0.85)",
            borderRadius: 32,
            border: "1.5px solid rgba(184,134,26,0.20)",
            boxShadow: "0 8px 60px rgba(184,134,26,0.14)",
            minWidth: 560,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://oubliejamaisbijoux.fr"}/logo.png`}
              width={110}
              height={109}
              alt=""
            />
            <span style={{ fontSize: 13, fontFamily: "sans-serif", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: "#1C1410" }}>
              N'OUBLIE JAMAIS
            </span>
            <span style={{ fontSize: 10, fontFamily: "sans-serif", letterSpacing: "0.18em", textTransform: "uppercase", color: "#B8861A" }}>
              Les émotions prennent une voix
            </span>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(184,134,26,0.3)" }} />
            <span style={{ color: "#B8861A", fontSize: 18 }}>♥</span>
            <div style={{ flex: 1, height: 1, background: "rgba(184,134,26,0.3)" }} />
          </div>

          {/* Names row */}
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A6455" }}>Message de</span>
              <span style={{ fontSize: 52, color: "#B8861A", fontFamily: "Georgia, serif" }}>{fromName}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 1, height: 20, background: "rgba(184,134,26,0.3)" }} />
              <span style={{ color: "#B8861A", fontSize: 24 }}>♥</span>
              <div style={{ width: 1, height: 20, background: "rgba(184,134,26,0.3)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A6455" }}>Pour</span>
              <span style={{ fontSize: 52, color: "#B8861A", fontFamily: "Georgia, serif" }}>{toName}</span>
            </div>
          </div>

          {date && (
            <span style={{ fontFamily: "sans-serif", fontSize: 14, color: "#7A6455", background: "rgba(184,134,26,0.08)", padding: "6px 18px", borderRadius: 20, border: "1px solid rgba(184,134,26,0.18)" }}>
              {date}
            </span>
          )}

          {/* Scan CTA */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 13, fontFamily: "sans-serif", color: "#B8861A", fontWeight: 700, letterSpacing: "0.1em" }}>
              ► Scannez le QR code pour écouter
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(to right, #8B6510, #D4A832, #8B6510)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
