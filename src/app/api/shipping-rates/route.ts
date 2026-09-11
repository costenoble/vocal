import { NextResponse } from "next/server";
import { getShippingSurcharges } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Lecture publique (pas de donnée sensible) : sert à afficher le détail du
// prix (article + livraison) sur /panier et /composer avant paiement.
export async function GET() {
  const shipping = await getShippingSurcharges();
  return NextResponse.json({ shipping });
}
