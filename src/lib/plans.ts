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
  {
    id: "coffret",
    name: "Le Coffret",
    tagline: "Parfait pour une famille ou un événement.",
    price: 34.90,
    features: [
      "5 cartes vocales personnalisées",
      "5 QR codes uniques",
      "5 pages d'écoute premium",
      "5 cartes PDF imprimables",
      "Liens actifs à vie",
      "Support prioritaire",
    ],
    highlight: false,
    expiresInDays: null,
    cardCount: 5,
  },
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
