import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ROUTE TEMPORAIRE — migration one-shot exécutée depuis le serveur déployé
// (la base n'est pas joignable depuis le poste de dev). Idempotente.
// À SUPPRIMER après exécution.
const TOKEN = "mig-20260703b-product-catalog-Qh7mZk3wTr8xLp";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-migrate-token") !== TOKEN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'bracelet',
      "tagline" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "price" DOUBLE PRECISION NOT NULL,
      "imageUrl" TEXT NOT NULL DEFAULT '',
      "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "details" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "active" BOOLEAN NOT NULL DEFAULT true,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug")`
  );
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Product" ("id", "slug", "name", "category", "tagline", "description", "price", "imageUrl", "sizes", "details", "active", "sortOrder", "updatedAt")
    VALUES (
      'seed-bracelet-nj', 'bracelet-nj', 'Bracelet N''OUBLIE JAMAIS', 'bracelet',
      'Coffret cadeau · Carte vocale incluse',
      'Un bracelet en pierre naturelle, réglable et accompagné de son médaillon exclusif N''OUBLIE JAMAIS. Livré avec sa carte vocale personnalisée et son QR code privé.',
      35, '',
      ARRAY['15 cm','16 cm','17 cm','18 cm','19 cm','20 cm'],
      ARRAY['Bracelet en pierre naturelle, réglable','Médaillon exclusif N''OUBLIE JAMAIS','Carte vocale personnalisée','QR code unique et sécurisé','Code d''accès privé','Enveloppe premium + livraison soignée'],
      true, 0, CURRENT_TIMESTAMP
    )
    ON CONFLICT ("slug") DO NOTHING
  `);

  // Bucket Supabase Storage public pour les photos produit.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_API_KEY;
  let bucketResult = "skipped";
  if (supabaseUrl && supabaseKey) {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: "products", name: "products", public: true }),
    });
    bucketResult = res.ok ? "created" : res.status === 400 ? "already-exists" : `error-${res.status}`;
  }

  const productCount = await prisma.product.count();

  return NextResponse.json({ ok: true, productCount, bucketResult });
}
