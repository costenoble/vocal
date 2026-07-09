import { prisma } from "@/lib/prisma";

export interface Product {
  slug: string;
  name: string;
  reference: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  sizes: string[];
  details: string[];
  stock: number | null; // null = stock non suivi (illimité)
  active: boolean;
  sortOrder: number;
}

function toProduct(p: {
  slug: string; name: string; reference: string; category: string; tagline: string;
  description: string; price: number; imageUrl: string; images: string[]; sizes: string[];
  details: string[]; stock: number | null; active: boolean; sortOrder: number;
}): Product {
  return {
    slug: p.slug, name: p.name, reference: p.reference, category: p.category, tagline: p.tagline,
    description: p.description, price: p.price, imageUrl: p.imageUrl, images: p.images,
    sizes: p.sizes, details: p.details, stock: p.stock, active: p.active, sortOrder: p.sortOrder,
  };
}


// Catalogue public — visible sur la boutique, le composer et à l'achat.
export async function getActiveProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toProduct);
}

// Recherche sans filtre d'activité : nécessaire pour afficher correctement
// les commandes passées même si le produit a depuis été désactivé (admin,
// carte PDF, image OG, webhook). Le blocage d'achat d'un produit inactif se
// fait explicitement au moment du checkout (voir les routes concernées).
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? toProduct(row) : undefined;
}

// Décrémente le stock d'un produit après une vente (seulement s'il est suivi,
// jamais en dessous de zéro). Sans effet si stock illimité (null).
export async function decrementStock(slug: string, qty: number): Promise<void> {
  if (qty <= 0) return;
  await prisma.$executeRaw`UPDATE "Product" SET stock = GREATEST(0, "stock" - ${qty}) WHERE slug = ${slug} AND "stock" IS NOT NULL`;
}

// Ensemble complet du catalogue pour l'admin (actifs + inactifs).
export async function getAllProductsAdmin(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toProduct);
}
