-- Remise en place : capacité de secours par produit, au cas où un bracelet
-- aurait besoin de ses propres photos de coffret en plus de la présentation
-- générale sur la page d'accueil. Invisible tant qu'aucune photo n'est ajoutée.
ALTER TABLE "Product" ADD COLUMN "showcaseImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
