-- Reference produit, stock, galerie photos
ALTER TABLE "Product" ADD COLUMN "reference" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "stock" INTEGER;
