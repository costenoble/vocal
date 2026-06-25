import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

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

  // Large QR for better scannability
  const qrDataUrl = await QRCode.toDataURL(listenUrl, {
    width: 600,
    margin: 2,
    color: { dark: "#B8861A", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });

  const dateFormatted = (() => {
    try {
      return new Date(message.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return message.date;
    }
  })();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carte N'OUBLIE JAMAIS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,500&family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --gold: #B8861A;
    --gold-light: #D4A832;
    --gold-dark: #8B6510;
    --cream: #FAF6EF;
    --ink: #1C1410;
    --ink-muted: #6B5040;
  }

  @media print {
    body { margin: 0; }
    .no-print { display: none !important; }
    .card { page-break-inside: avoid; }
  }

  body {
    background: #F0E8D8;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .page-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  /* Print hint */
  .print-hint {
    font-size: 12px;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .print-btn {
    padding: 8px 20px;
    background: var(--gold);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
  }

  /* Card — CR80 format (85.6mm × 53.98mm) × 2 = carte type carte de vœux */
  .card {
    width: 320px;
    background: var(--cream);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(184,134,26,0.18), 0 4px 16px rgba(0,0,0,0.08);
    border: 1px solid rgba(184,134,26,0.25);
    position: relative;
  }

  /* Gold top stripe */
  .card-stripe {
    height: 5px;
    background: linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark));
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 24px 24px;
    gap: 18px;
  }

  /* Brand */
  .brand { text-align: center; }
  .brand-name {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-size: 16px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .brand-tagline {
    font-size: 9px;
    color: var(--gold);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 3px;
    font-weight: 600;
  }
  .brand-sub {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 12px;
    color: var(--gold);
    margin-top: 4px;
  }

  /* Divider */
  .divider {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--gold));
    opacity: 0.4;
  }
  .divider-line.rev {
    background: linear-gradient(to left, transparent, var(--gold));
  }
  .heart-icon {
    color: var(--gold);
    font-size: 14px;
    line-height: 1;
  }

  /* From / To */
  .names-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-around;
    width: 100%;
    gap: 12px;
  }
  .name-block { text-align: center; flex: 1; }
  .name-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-muted);
    display: block;
    margin-bottom: 3px;
  }
  .name-value {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 500;
    color: var(--gold);
    line-height: 1.1;
    display: block;
  }
  .names-sep {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 14px;
    gap: 4px;
  }
  .names-sep .heart-icon { font-size: 16px; }
  .names-sep .vline {
    width: 1px;
    height: 16px;
    background: rgba(184,134,26,0.25);
  }

  /* Date pill */
  .date-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    background: rgba(184,134,26,0.08);
    border: 1px solid rgba(184,134,26,0.2);
    border-radius: 20px;
  }
  .date-text {
    font-size: 11px;
    font-weight: 600;
    color: var(--gold);
  }

  /* Separator line */
  .sep-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(184,134,26,0.2), transparent);
  }

  /* QR section */
  .qr-section { text-align: center; }
  .qr-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 10px;
    display: block;
  }
  .qr-wrapper {
    display: inline-flex;
    padding: 10px;
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(184,134,26,0.15);
    box-shadow: 0 4px 16px rgba(184,134,26,0.10);
  }
  .qr-img {
    width: 140px;
    height: 140px;
    display: block;
  }
  .qr-hint {
    font-size: 9px;
    color: var(--ink-muted);
    margin-top: 8px;
    opacity: 0.7;
  }

  /* Footer */
  .card-footer { text-align: center; }
  .card-footer p {
    font-size: 9px;
    color: var(--ink-muted);
    opacity: 0.65;
    line-height: 1.6;
  }

  /* Corner decorations */
  .corner {
    position: absolute;
    width: 40px;
    height: 40px;
    opacity: 0.12;
  }
  .corner-tl { top: 8px; left: 8px; border-top: 1.5px solid var(--gold); border-left: 1.5px solid var(--gold); border-radius: 6px 0 0 0; }
  .corner-tr { top: 8px; right: 8px; border-top: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); border-radius: 0 6px 0 0; }
  .corner-bl { bottom: 8px; left: 8px; border-bottom: 1.5px solid var(--gold); border-left: 1.5px solid var(--gold); border-radius: 0 0 0 6px; }
  .corner-br { bottom: 8px; right: 8px; border-bottom: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); border-radius: 0 0 6px 0; }
</style>
</head>
<body>
<div class="page-wrap">

  <!-- Print button -->
  <div class="print-hint no-print">
    <span>Carte prête à imprimer</span>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimer</button>
  </div>

  <!-- Card -->
  <div class="card">
    <div class="card-stripe"></div>

    <!-- Corner accents -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="card-inner">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-name">N'OUBLIE JAMAIS</div>
        <div class="brand-tagline">Un souvenir qui traverse le temps</div>
        <div class="brand-sub">À chaque personne son message.</div>
      </div>

      <!-- Divider -->
      <div class="divider">
        <div class="divider-line"></div>
        <span class="heart-icon">♥</span>
        <div class="divider-line rev"></div>
      </div>

      <!-- From / To -->
      <div class="names-row">
        <div class="name-block">
          <span class="name-label">Message de</span>
          <span class="name-value">${escapeHtml(message.fromName)}</span>
        </div>
        <div class="names-sep">
          <div class="vline"></div>
          <span class="heart-icon">♥</span>
          <div class="vline"></div>
        </div>
        <div class="name-block">
          <span class="name-label">Pour</span>
          <span class="name-value">${escapeHtml(message.toName)}</span>
        </div>
      </div>

      <!-- Date -->
      <div class="date-pill">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B8861A" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span class="date-text">${dateFormatted}</span>
      </div>

      <!-- Separator -->
      <div class="sep-line"></div>

      <!-- QR Code -->
      <div class="qr-section">
        <span class="qr-label">Scannez pour écouter</span>
        <div class="qr-wrapper">
          <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
        </div>
        <p class="qr-hint">Pointez votre appareil photo sur ce code</p>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <p>Créé avec N'OUBLIE JAMAIS</p>
        <p>Un message unique · Un souvenir précieux</p>
      </div>

    </div><!-- /.card-inner -->
  </div><!-- /.card -->

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
