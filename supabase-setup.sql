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
