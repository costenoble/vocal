-- Suivi de colis
ALTER TABLE "Message" ADD COLUMN "trackingNumber" TEXT;
ALTER TABLE "Message" ADD COLUMN "trackingCarrier" TEXT;
