import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

// Fiche produit publique — n'expose un produit désactivé à personne d'autre
// que l'admin (les commandes déjà passées sur un produit retiré restent
// consultables ailleurs via getProductBySlug côté serveur, pas ici).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  // La référence produit reste interne (admin) : non exposée publiquement.
  const { reference: _r, ...publicProduct } = product;
  return NextResponse.json({ product: publicProduct });
}
