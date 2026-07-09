import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function esc(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Bon de commande imprimable (préparation / archivage). Réservé à l'admin.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const m = await prisma.message.findUnique({ where: { slug } });
  if (!m) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const created = new Date(m.createdAt).toLocaleString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#7A6455;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:180px;vertical-align:top;">${label}</td>
     <td style="padding:8px 0;color:#1C1410;font-size:15px;font-weight:600;">${value || "—"}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bon de commande — ${esc(m.fromName)} → ${esc(m.toName)}</title>
<style>
  @media print { .noprint { display:none; } @page { margin: 18mm; } }
  body { margin:0; background:#F0E8D8; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color:#1C1410; }
  .sheet { max-width: 720px; margin: 24px auto; background:white; border-radius:14px; overflow:hidden; box-shadow:0 8px 40px rgba(28,20,16,0.12); }
  .stripe { height:5px; background:linear-gradient(to right,#8B6510,#D4A832,#8B6510); }
  .pad { padding: 32px 36px; }
  h1 { font-size:22px; margin:0 0 4px; letter-spacing:0.14em; text-transform:uppercase; }
  .ref { font-size:12px; color:#7A6455; }
  .box { border:1px solid rgba(184,134,26,0.25); border-radius:12px; padding:18px 22px; margin-top:18px; }
  .box h2 { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#B8861A; margin:0 0 8px; }
  .code { font-size:26px; font-weight:900; letter-spacing:0.3em; color:#B8861A; }
  .btn { display:inline-block; margin:16px 8px 0 0; padding:10px 20px; background:#1C1410; color:white; border-radius:10px; text-decoration:none; font-size:13px; font-weight:700; }
  table { width:100%; border-collapse:collapse; }
</style></head>
<body>
  <div class="sheet">
    <div class="stripe"></div>
    <div class="pad">
      <h1>Bon de commande</h1>
      <p class="ref">Réf. ${esc(m.slug)} · Commandée le ${created} · ${m.paid ? "Payée" : "En attente de paiement"}${m.orderId ? ` · Commande groupée ${esc(m.orderId)}` : ""}</p>

      <div class="box">
        <h2>Bijou à préparer</h2>
        <table>
          ${row("Produit", esc(m.productName) || "—")}
          ${row("Taille", esc(m.productSize) || "Taille unique")}
        </table>
      </div>

      <div class="box">
        <h2>Carte vocale</h2>
        <table>
          ${row("De", esc(m.fromName))}
          ${row("Pour", esc(m.toName))}
          ${m.date ? row("Date / occasion", esc(m.date)) : ""}
          ${m.message ? row("Message imprimé", esc(m.message)) : ""}
        </table>
        ${m.accessCode ? `<div style="margin-top:12px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#7A6455;">Code d'accès (à imprimer au dos de la carte)</div>
          <div class="code">${esc(m.accessCode)}</div>
        </div>` : ""}
      </div>

      <div class="box">
        <h2>Livraison</h2>
        ${m.shipName || m.shipAddress
          ? `<p style="margin:0;font-size:15px;line-height:1.7;">
              <strong>${esc(m.shipName)}</strong><br>
              ${esc(m.shipAddress)}${m.shipComplement ? ", " + esc(m.shipComplement) : ""}<br>
              ${esc(m.shipPostalCode)} ${esc(m.shipCity)} · ${esc(m.shipCountry)}
            </p>`
          : `<p style="margin:0;color:#7A6455;font-style:italic;">Remise en main propre (vente boutique) — pas d'adresse.</p>`}
        ${m.buyerEmail ? `<p style="margin:10px 0 0;font-size:13px;color:#7A6455;">Email acheteur : ${esc(m.buyerEmail)}</p>` : ""}
        ${m.trackingNumber ? `<p style="margin:6px 0 0;font-size:13px;color:#7A6455;">Suivi : <strong>${esc(m.trackingNumber)}</strong>${m.trackingCarrier ? " (" + esc(m.trackingCarrier) + ")" : ""}</p>` : ""}
      </div>

      <div class="noprint">
        <a class="btn" href="/api/pdf/${esc(m.slug)}" target="_blank">Imprimer la carte</a>
        <a class="btn" href="#" onclick="window.print();return false;" style="background:#B8861A;">Imprimer / Enregistrer en PDF</a>
      </div>
    </div>
  </div>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
