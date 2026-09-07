import path from "node:path";
import { Font } from "@react-pdf/renderer";

// react-pdf ne peut pas s'appuyer sur les polices système ni sur Google Fonts
// (rendu côté serveur, sans navigateur) : on embarque les coupes nécessaires
// en local. "Brush Script MT" (police "script" du composer) n'existe pas hors
// Windows — Dancing Script est utilisée comme équivalent manuscrit.
const dir = path.join(process.cwd(), "src/lib/pdf/font-files");

let registered = false;

export function registerCardFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(dir, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "Inter-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(dir, "Inter-ExtraBold.ttf"), fontWeight: 800 },
      { src: path.join(dir, "Inter-Black.ttf"), fontWeight: 900 },
    ],
  });

  Font.register({
    family: "Playfair Display",
    fonts: [
      { src: path.join(dir, "PlayfairDisplay-Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "PlayfairDisplay-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Dancing Script",
    fonts: [
      { src: path.join(dir, "DancingScript-Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "DancingScript-Regular.ttf"), fontWeight: 400, fontStyle: "italic" },
    ],
  });

  // Évite les césures automatiques hasardeuses sur les mots français.
  Font.registerHyphenationCallback((word) => [word]);
}
