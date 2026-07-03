-- Catalogue produits (bracelets, colliers...) géré depuis l'admin
CREATE TABLE "Product" (
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
);

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- Préserve le produit existant (déjà référencé par des commandes payées)
INSERT INTO "Product" ("id", "slug", "name", "category", "tagline", "description", "price", "imageUrl", "sizes", "details", "active", "sortOrder", "updatedAt")
VALUES (
  'seed-bracelet-nj',
  'bracelet-nj',
  'Bracelet N''OUBLIE JAMAIS',
  'bracelet',
  'Coffret cadeau · Carte vocale incluse',
  'Un bracelet en pierre naturelle, réglable et accompagné de son médaillon exclusif N''OUBLIE JAMAIS. Livré avec sa carte vocale personnalisée et son QR code privé.',
  35,
  '',
  ARRAY['15 cm','16 cm','17 cm','18 cm','19 cm','20 cm'],
  ARRAY['Bracelet en pierre naturelle, réglable','Médaillon exclusif N''OUBLIE JAMAIS','Carte vocale personnalisée','QR code unique et sécurisé','Code d''accès privé','Enveloppe premium + livraison soignée'],
  true,
  0,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
