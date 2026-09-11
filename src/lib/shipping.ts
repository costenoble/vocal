// Frais de livraison additionnels pour les adresses hors France (le prix
// affiché sur le site inclut la livraison pour la France uniquement).
//
// Tant que ce montant vaut 0, aucun frais n'est ajouté nulle part : le
// checkout se comporte exactement comme avant. Dès que le montant exact est
// connu (à confirmer avec le client), il suffit de changer cette valeur —
// rien d'autre à modifier.
export const EUROPE_SHIPPING_SURCHARGE = 0;

export function needsShippingSurcharge(country: string | null | undefined): boolean {
  return EUROPE_SHIPPING_SURCHARGE > 0 && !!country && country.trim() !== "France";
}
