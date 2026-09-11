// Fonction pure (sans dépendance serveur) : utilisable aussi bien côté
// client (aperçu du prix sur /panier et /composer) que côté serveur
// (src/lib/settings.ts, calcul du montant réel au paiement).
export type ShippingZone = "france" | "europe" | "horsEurope";

// Pas de vraie liste de pays européens dans le formulaire (juste "Autre" en
// texte libre) : tout pays non listé est classé par défaut hors Europe,
// plus prudent que de sous-facturer.
export function getShippingZone(country: string | null | undefined): ShippingZone {
  const c = (country ?? "").trim();
  if (!c || c === "France") return "france";
  if (c === "Belgique" || c === "Suisse" || c === "Luxembourg") return "europe";
  return "horsEurope";
}
