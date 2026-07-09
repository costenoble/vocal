import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ROUTE TEMPORAIRE — colonnes de suivi. À SUPPRIMER après exécution.
const TOKEN = "mig-20260709-tracking-Pv6xNc3wQr8mYk";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-migrate-token") !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "trackingCarrier" TEXT`);
  return NextResponse.json({ ok: true });
}
