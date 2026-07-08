// Collections de produits — partagées entre la boutique (filtres) et l'admin
// (choix à la création d'un produit). Fichier sans dépendance serveur pour
// pouvoir être importé côté client.

export interface CategoryOption {
  value: string; // stocké en base (minuscules)
  label: string; // affiché aux visiteurs
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "femme", label: "Bracelets Femme" },
  { value: "homme", label: "Bracelets Homme" },
  { value: "mixte", label: "Mixte" },
];

// Libellé affichable d'une catégorie ; gère les valeurs héritées (ex.
// "bracelet") en les capitalisant proprement.
export function categoryLabel(value: string): string {
  const v = (value || "").toLowerCase();
  const found = CATEGORY_OPTIONS.find((c) => c.value === v);
  if (found) return found.label;
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Autres";
}

// Ordre d'affichage des onglets : femme, homme, mixte, puis le reste.
export function sortCategories(values: string[]): string[] {
  const order = CATEGORY_OPTIONS.map((c) => c.value);
  return [...values].sort((a, b) => {
    const ia = order.indexOf(a.toLowerCase());
    const ib = order.indexOf(b.toLowerCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
