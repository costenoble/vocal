import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

// Paper + font tables mirror the composer preview (src/lib/products aside).
const PAPERS: Record<string, { bg: string; text: string; accent: string; shimmer: boolean; darkQr: boolean }> = {
  ivoire: { bg: "#F5EED5", text: "#1C1410", accent: "#8B6510", shimmer: false, darkQr: false },
  nacre:  { bg: "#F9F8F3", text: "#1C1410", accent: "#8B6510", shimmer: true,  darkQr: false },
  lin:    { bg: "#DFD0B4", text: "#2A1B0E", accent: "#6B4C1E", shimmer: false, darkQr: false },
  noir:   { bg: "#18120C", text: "#F0E8D8", accent: "#D4A832", shimmer: false, darkQr: true },
};

const FONTS: Record<string, { family: string; italic: boolean }> = {
  playfair: { family: "'Playfair Display', serif", italic: true },
  inter:    { family: "'Inter', sans-serif", italic: false },
  script:   { family: "'Brush Script MT', 'Segoe Script', cursive", italic: false },
};

function logoSvg(size: number, accent: string) {
  return `<svg viewBox="0 0 220 220" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="110" cy="110" r="96" stroke="${accent}" stroke-width="1.6"/>
    <circle cx="110" cy="110" r="86" stroke="${accent}" stroke-width="0.6" opacity="0.4"/>
    <text x="110" y="126" text-anchor="middle" font-size="58" fill="${accent}" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-weight="500" letter-spacing="4">NJ</text>
    <path d="M163,54 C165,60 165,60 171,62 C165,64 165,64 163,70 C161,64 161,64 155,62 C161,60 161,60 163,54Z" fill="${accent}"/>
    <path d="M176,84 C177,87 177,87 180,88 C177,89 177,89 176,92 C175,89 175,89 172,88 C175,87 175,87 176,84Z" fill="${accent}"/>
  </svg>`;
}

function heartLine(accent: string, widthPct: number) {
  return `<div style="display:flex;align-items:center;gap:5px;width:${widthPct}%;">
    <div style="flex:1;height:0.5px;background:${accent};opacity:0.45;"></div>
    <svg viewBox="0 0 16 16" fill="${accent}" width="8" height="8" style="opacity:0.7;flex-shrink:0;"><path d="M8 14l-1-0.9C3.5 10.2 1 8.1 1 5.5 1 3.4 2.7 2 4.5 2c1.2 0 2.4.6 3.5 1.7C9.1 2.6 10.3 2 11.5 2 13.3 2 15 3.4 15 5.5c0 2.6-2.5 4.7-6 8.6L8 14z"/></svg>
    <div style="flex:1;height:0.5px;background:${accent};opacity:0.45;"></div>
  </div>`;
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

  const baseUrl = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
  const listenUrl = `${baseUrl}/listen/${message.slug}`;

  const paper = PAPERS[message.paper] ?? PAPERS.ivoire;
  const font = FONTS[message.cardFont] ?? FONTS.playfair;
  const nameFamily = font.family;
  const nameItalic = message.cardFont === "inter" ? "normal" : "italic";

  const qrDataUrl = await QRCode.toDataURL(listenUrl, {
    width: 600,
    margin: 1,
    color: { dark: "#1C1410", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });

  const dateFormatted = (() => {
    try {
      return new Date(message.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch { return message.date; }
  })();

  const shimmer = paper.shimmer
    ? `<div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.22) 55%,rgba(255,255,255,0) 70%);pointer-events:none;z-index:2;"></div>`
    : "";

  const cardBase = `position:relative;width:105mm;height:148mm;background:${paper.bg};display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:9mm 8mm;overflow:hidden;box-shadow:0 16px 48px rgba(28,20,16,0.16);`;
  const inset = `<div style="position:absolute;inset:5mm;border:0.5px solid ${paper.accent};opacity:0.4;pointer-events:none;z-index:1;"></div>`;
  const label = `font-size:8px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${paper.text};opacity:0.4;font-family:'Inter',sans-serif;`;

  // ── RECTO ──
  const recto = `<div style="${cardBase}">
    ${inset}${shimmer}
    <div style="z-index:3;margin-top:4px;">${logoSvg(66, paper.accent)}</div>
    <div style="text-align:center;z-index:3;">
      <p style="font-size:12px;font-weight:900;letter-spacing:0.28em;text-transform:uppercase;color:${paper.text};font-family:'Inter',sans-serif;margin:0;">N'OUBLIE JAMAIS</p>
      <div style="height:0.5px;background:${paper.accent};opacity:0.35;margin-top:5px;"></div>
    </div>
    <div style="z-index:3;width:72%;">${heartLine(paper.accent, 100)}</div>
    <div style="text-align:center;z-index:3;">
      <p style="font-size:11px;color:${paper.text};opacity:0.65;font-family:'Playfair Display',serif;line-height:1.5;margin:0;">Certains messages<br/>ne s'oublient pas.</p>
      <p style="font-size:13px;font-family:${nameFamily};font-style:italic;color:${paper.accent};margin:4px 0 0;">Ils se portent.</p>
    </div>
    <div style="z-index:3;padding:6px;background:${paper.darkQr ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.88)"};border-radius:6px;">
      <img src="${qrDataUrl}" width="150" height="150" style="display:block;" alt="QR"/>
    </div>
    ${message.accessCode ? `<div style="z-index:3;text-align:center;">
      <p style="${label}margin:0;">Code d'accès</p>
      <p style="font-size:20px;font-weight:900;letter-spacing:0.34em;color:${paper.accent};font-family:'Inter',sans-serif;margin:2px 0 0;">${escapeHtml(message.accessCode)}</p>
    </div>` : ""}
    <div style="display:flex;align-items:center;gap:5px;z-index:3;">
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none"><rect x="5" y="2" width="14" height="20" rx="3" stroke="${paper.accent}" stroke-width="1.4"/><rect x="9" y="18" width="6" height="1.5" rx="0.75" fill="${paper.accent}"/></svg>
      <p style="font-size:8px;color:${paper.text};opacity:0.5;font-family:'Inter',sans-serif;letter-spacing:0.04em;margin:0;">Scannez pour écouter votre message</p>
    </div>
    <div style="z-index:3;width:60%;padding-bottom:4px;">${heartLine(paper.accent, 100)}</div>
  </div>`;

  // ── VERSO ──
  const nameStyle = `font-size:20px;font-family:${nameFamily};font-style:${nameItalic};color:${paper.accent};line-height:1.2;margin:0;`;
  const verso = `<div style="${cardBase}">
    ${inset}
    <div style="z-index:3;width:65%;padding-top:4px;">${heartLine(paper.accent, 100)}</div>
    <div style="text-align:center;z-index:3;">
      <p style="${label}margin:0;">Message de</p>
      <p style="${nameStyle}">${escapeHtml(message.fromName)}</p>
    </div>
    <div style="z-index:3;width:50%;">${heartLine(paper.accent, 100)}</div>
    <div style="text-align:center;z-index:3;">
      <p style="${label}margin:0;">Pour</p>
      <p style="${nameStyle}">${escapeHtml(message.toName)}</p>
    </div>
    ${dateFormatted ? `<div style="text-align:center;z-index:3;">
      <p style="${label}margin:0;">Créé le</p>
      <p style="font-size:10px;font-family:'Playfair Display',serif;font-style:italic;color:${paper.text};opacity:0.7;margin:2px 0 0;">${escapeHtml(dateFormatted)}</p>
    </div>` : ""}
    <div style="z-index:3;">${logoSvg(38, paper.accent)}</div>
    <div style="text-align:center;z-index:3;padding:0 6px;">
      ${message.message
        ? `<p style="font-size:10px;font-family:${nameFamily};font-style:italic;color:${paper.text};opacity:0.72;line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(message.message)}</p>`
        : ""}
      <p style="font-size:12px;margin:6px 0 0;font-family:${nameFamily};font-style:italic;color:${paper.accent};">N'oublie jamais.</p>
    </div>
    <div style="z-index:3;padding-bottom:4px;">
      <svg viewBox="0 0 16 16" fill="${paper.accent}" width="10" height="10" style="opacity:0.6;"><path d="M8 14l-1-0.9C3.5 10.2 1 8.1 1 5.5 1 3.4 2.7 2 4.5 2c1.2 0 2.4.6 3.5 1.7C9.1 2.6 10.3 2 11.5 2 13.3 2 15 3.4 15 5.5c0 2.6-2.5 4.7-6 8.6L8 14z"/></svg>
    </div>
  </div>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carte N'OUBLIE JAMAIS — ${escapeHtml(message.fromName)} pour ${escapeHtml(message.toName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,500&family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#DEDAD5; font-family:'Inter',sans-serif; display:flex; flex-direction:column; align-items:center; padding:24px 16px 40px; min-height:100vh; }
  .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:22px; }
  .toolbar span { font-size:12px; color:#6B5040; }
  .print-btn { padding:9px 22px; background:#B8861A; color:#fff; border:none; border-radius:22px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; }
  .cards { display:flex; gap:22px; flex-wrap:wrap; justify-content:center; }
  .card-wrap { display:flex; flex-direction:column; align-items:center; gap:8px; }
  .card-label { font-size:9px; font-weight:800; letter-spacing:0.22em; text-transform:uppercase; color:#8A7258; }
  @page { size: A4 landscape; margin: 8mm; }
  @media print {
    body { background:#fff; padding:0; }
    .no-print { display:none !important; }
    .cards { gap:10mm; }
    .card-wrap { gap:0; }
    .card-label { display:none; }
  }
</style>
</head>
<body>
  <div class="toolbar no-print">
    <span>Carte prête à imprimer — recto / verso, format A6</span>
    <button class="print-btn" onclick="window.print()">Imprimer</button>
  </div>
  <div class="cards">
    <div class="card-wrap"><span class="card-label no-print">Recto</span>${recto}</div>
    <div class="card-wrap"><span class="card-label no-print">Verso</span>${verso}</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="carte-nj-${message.slug}.html"`,
    },
  });
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
