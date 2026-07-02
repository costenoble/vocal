-- Réponse vocale du destinataire + suivi de l'email J+3
ALTER TABLE "Message" ADD COLUMN "replyAudioUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN "replyFromName" TEXT;
ALTER TABLE "Message" ADD COLUMN "replyAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN "followupSentAt" TIMESTAMP(3);
