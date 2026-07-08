-- Regroupement des articles d'une meme commande (panier)
ALTER TABLE "Message" ADD COLUMN "orderId" TEXT;
CREATE INDEX "Message_orderId_idx" ON "Message"("orderId");
