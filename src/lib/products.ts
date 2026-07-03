import { prisma } from "@/lib/prisma";

export interface Product {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: string[];
  details: string[];
  active: boolean;
  sortOrder: number;
}

function toProduct(p: {
  slug: string; name: string; category: string; tagline: string;
  description: string; price: number; imageUrl: string; sizes: string[];
  details: string[]; active: boolean; sortOrder: number;
}): Product {
  return {
    slug: p.slug, name: p.name, category: p.category, tagline: p.tagline,
    description: p.description, price: p.price, imageUrl: p.imageUrl,
    sizes: p.sizes, details: p.details, active: p.active, sortOrder: p.sortOrder,
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

// Ensemble complet du catalogue pour l'admin (actifs + inactifs).
export async function getAllProductsAdmin(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toProduct);
}
