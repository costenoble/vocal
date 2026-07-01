export interface Product {
  slug: string;
  name: string;
  category: "bracelet" | "collier";
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: string[];
  details: string[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "bracelet-nj",
    name: "Bracelet N'OUBLIE JAMAIS",
    category: "bracelet",
    tagline: "Coffret cadeau · Carte vocale incluse",
    description:
      "Un bracelet en pierre naturelle, réglable et accompagné de son médaillon exclusif N'OUBLIE JAMAIS. Livré avec sa carte vocale personnalisée et son QR code privé.",
    price: 35,
    imageUrl: "/images/bracelet-nj.jpg",
    sizes: ["15 cm", "16 cm", "17 cm", "18 cm", "19 cm", "20 cm"],
    details: [
      "Bracelet en pierre naturelle, réglable",
      "Médaillon exclusif N'OUBLIE JAMAIS",
      "Carte vocale personnalisée",
      "QR code unique et sécurisé",
      "Code d'accès privé",
      "Enveloppe premium + livraison soignée",
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
