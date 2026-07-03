import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Catalogue public — consommé par la boutique et le composer.
export async function GET() {
  const products = await getActiveProducts();
  return NextResponse.json({ products });
}
