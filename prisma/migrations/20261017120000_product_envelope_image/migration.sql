-- Photo rectangulaire dédiée de l'enveloppe (distincte des photos carrées du bijou)
ALTER TABLE "Product" ADD COLUMN "envelopeImageUrl" TEXT NOT NULL DEFAULT '';
