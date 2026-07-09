-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER,
    "plan" TEXT NOT NULL DEFAULT 'precieux',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'web',
    "stripeSessionId" TEXT,
    "buyerEmail" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'classique',
    "paper" TEXT NOT NULL DEFAULT 'ivoire',
    "cardFont" TEXT NOT NULL DEFAULT 'playfair',
    "message" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "accessCode" TEXT,
    "productSlug" TEXT,
    "productName" TEXT,
    "productSize" TEXT,
    "shipName" TEXT,
    "shipAddress" TEXT,
    "shipComplement" TEXT,
    "shipPostalCode" TEXT,
    "shipCity" TEXT,
    "shipCountry" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_slug_key" ON "Message"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Message_stripeSessionId_key" ON "Message"("stripeSessionId");


-- ── Migration 20260702 : réponse vocale + email de suivi J+3 ─────────────────
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "replyAudioUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "replyFromName" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "replyAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "followupSentAt" TIMESTAMP(3);

-- ── Migration 20260702b : formulaire de contact ───────────────────────────────
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- ── Migration 20260703 : suivi d'expédition ───────────────────────────────────
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP(3);

-- ── Migration 20260703 : catalogue produits ───────────────────────────────────
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
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
ON CONFLICT ("slug") DO NOTHING;

-- ── Migration 20260706 : comptes d'administration ────────────────────────────
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username");

-- ── Migration 20260708 : commandes groupées (panier) ─────────────────────────
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
CREATE INDEX IF NOT EXISTS "Message_orderId_idx" ON "Message"("orderId");

-- ── Migration 20260709 : suivi de colis ──────────────────────────────────────
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "trackingCarrier" TEXT;
