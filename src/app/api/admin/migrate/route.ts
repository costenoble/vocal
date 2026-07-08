import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ROUTE TEMPORAIRE — migration one-shot (colonne orderId pour le panier).
// À SUPPRIMER après exécution.
const TOKEN = "mig-20260708-order-id-Rk9mVx2pWq7nZt";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-migrate-token") !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "orderId" TEXT`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Message_orderId_idx" ON "Message"("orderId")`);

  return NextResponse.json({ ok: true });
}
