// Notification Discord (salon #commandes) à chaque commande validée.
// Best-effort : ne doit jamais faire échouer la commande elle-même si
// Discord est indisponible ou si le webhook n'est pas configuré.
export async function notifyDiscordNewOrder(params: {
  fromName: string;
  toName: string;
  productLabel: string;
  price: number;
  shipCountry?: string | null;
  source?: string;
  adminUrl: string;
}): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const { fromName, toName, productLabel, price, shipCountry, source, adminUrl } = params;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🛎️ Nouvelle commande",
            color: 0xb8861a,
            fields: [
              { name: "De → Pour", value: `${fromName} → ${toName}` },
              { name: "Produit", value: productLabel, inline: true },
              { name: "Montant", value: `${price.toFixed(2).replace(".", ",")} €`, inline: true },
              ...(shipCountry ? [{ name: "Livraison", value: shipCountry, inline: true }] : []),
              ...(source ? [{ name: "Origine", value: source, inline: true }] : []),
            ],
            url: adminUrl,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[discord] Webhook a répondu", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[discord]", err);
  }
}
