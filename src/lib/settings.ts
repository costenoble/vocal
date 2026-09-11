import { prisma } from "@/lib/prisma";

const EUROPE_KEY = "shipping_surcharge_europe_eur";
const HORS_EUROPE_KEY = "shipping_surcharge_hors_europe_eur";

export type ShippingZone = "france" | "europe" | "horsEurope";

// Le prix affiché sur le site inclut déjà la livraison pour la France (pas
// de frais séparés). Pour les autres destinations, deux paliers réglables
// depuis /admin/settings (0 = désactivé) :
// - "europe"    : Belgique, Suisse, Luxembourg
// - "horsEurope": Canada, et tout pays saisi via "Autre" (Italie, etc.) —
//                 par défaut classé hors Europe, faute de connaître chaque
//                 pays possible ; à ajuster si besoin.
export function getShippingZone(country: string | null | undefined): ShippingZone {
  const c = (country ?? "").trim();
  if (!c || c === "France") return "france";
  if (c === "Belgique" || c === "Suisse" || c === "Luxembourg") return "europe";
  return "horsEurope";
}

async function readAmount(key: string): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key } });
  const value = row ? Number(row.value) : 0;
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

async function writeAmount(key: string, amount: number): Promise<void> {
  const value = Math.max(0, Math.round(amount * 100) / 100).toString();
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export async function getShippingSurcharges(): Promise<{ europe: number; horsEurope: number }> {
  const [europe, horsEurope] = await Promise.all([readAmount(EUROPE_KEY), readAmount(HORS_EUROPE_KEY)]);
  return { europe, horsEurope };
}

export async function setShippingSurcharges(amounts: { europe: number; horsEurope: number }): Promise<void> {
  await Promise.all([writeAmount(EUROPE_KEY, amounts.europe), writeAmount(HORS_EUROPE_KEY, amounts.horsEurope)]);
}

// Montant à ajouter en supplément pour une adresse donnée (0 si France ou
// si le palier concerné est désactivé).
export async function getSurchargeForCountry(country: string | null | undefined): Promise<number> {
  const zone = getShippingZone(country);
  if (zone === "france") return 0;
  const { europe, horsEurope } = await getShippingSurcharges();
  return zone === "europe" ? europe : horsEurope;
}
