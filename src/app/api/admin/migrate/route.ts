import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ROUTE TEMPORAIRE — migration one-shot exécutée depuis le serveur déployé
// (la base n'était pas joignable depuis le poste de dev). Idempotente.
// À SUPPRIMER après exécution.
const TOKEN = "mig-20260703-vJ2sJq8wXk4bTn9zPe3rGm";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-migrate-token") !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP(3)`
  );
  const cleaned = await prisma.$executeRawUnsafe(
    `DELETE FROM "ContactMessage" WHERE name = 'Test Claude'`
  );

  return NextResponse.json({ ok: true, testMessagesCleaned: Number(cleaned) });
}
