// Helpers produit utilisables côté client (aucune dépendance serveur / Prisma).

// Un produit est achetable s'il est actif et non en rupture (stock null =
// illimité, sinon > 0).
export function isPurchasable(p: { active: boolean; stock: number | null }): boolean {
  return p.active && (p.stock === null || p.stock > 0);
}

// Prix formaté à la française : 49,90 € · 35,00 €.
export function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}
