-- "Suppression" dans l'admin devient un archivage : on ne veut plus jamais
-- effacer le message vocal d'un client par erreur. La commande disparaît de
-- la liste admin mais la carte (page d'écoute + PDF) continue de fonctionner.
ALTER TABLE "Message" ADD COLUMN "archivedAt" TIMESTAMP(3);
