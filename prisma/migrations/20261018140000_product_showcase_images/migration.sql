-- Photos de présentation du coffret (boîte ouverte/fermée...), affichées
-- entières, distinctes des photos carrées du bijou et de la photo d'enveloppe.
ALTER TABLE "Product" ADD COLUMN "showcaseImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
