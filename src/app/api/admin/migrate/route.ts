import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ROUTE TEMPORAIRE — reference / stock / galerie. À SUPPRIMER après exécution.
const TOKEN = "mig-20260709-refstock-Zx8kPq4wVt2nRm";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-migrate-token") !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "reference" TEXT NOT NULL DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[]`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stock" INTEGER`);
  return NextResponse.json({ ok: true });
}
