-- Retrait : le client souhaite finalement une présentation du coffret
-- unique sur la page d'accueil plutôt que répétée sur chaque fiche produit.
ALTER TABLE "Product" DROP COLUMN "showcaseImages";
