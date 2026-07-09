import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Catalogue public — consommé par la boutique et le composer.
// La référence produit est une donnée interne (admin) : on ne l'expose pas.
export async function GET() {
  const products = (await getActiveProducts()).map(({ reference: _r, ...p }) => p);
  return NextResponse.json({ products });
}
