export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
  highlight?: boolean;
  expiresInDays: number | null;
  cardCount: number;
}

export const PLANS: Plan[] = [
  {
    id: "carte",
    name: "La Carte",
    tagline: "Un souvenir unique, pour toujours.",
    price: 14.90,
    features: [
      "1 carte vocale personnalisée",
      "QR code unique généré",
      "Page d'écoute premium",
      "Carte PDF imprimable",
      "Lien actif à vie",
      "Confirmation par email",
    ],
    highlight: true,
    expiresInDays: null,
    cardCount: 1,
  },
  // "Le Coffret" (5 cartes, 34,90 €) retiré de la vente : le webhook ne crée
  // qu'un Message par commande. Réactiver uniquement avec la génération des
  // 5 cartes (slugs, codes d'accès, email récapitulatif).
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getExpiresAt(plan: Plan): Date | null {
  if (plan.expiresInDays === null) return null;
  const d = new Date();
  d.setDate(d.getDate() + plan.expiresInDays);
  return d;
}
