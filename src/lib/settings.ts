import { prisma } from "@/lib/prisma";
import { getShippingZone } from "@/lib/shipping-zone";

export { getShippingZone } from "@/lib/shipping-zone";
export type { ShippingZone } from "@/lib/shipping-zone";

const KEYS = {
  france: "shipping_surcharge_france_eur",
  europe: "shipping_surcharge_europe_eur",
  horsEurope: "shipping_surcharge_hors_europe_eur",
} as const;

export type ShippingRates = { france: number; europe: number; horsEurope: number };

async function readAmount(key: string): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key } });
  const value = row ? Number(row.value) : 0;
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

async function writeAmount(key: string, amount: number): Promise<void> {
  const value = Math.max(0, Math.round(amount * 100) / 100).toString();
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

// Frais de livraison par zone, réglables depuis /admin/settings (0 =
// désactivé). Les trois paliers fonctionnent de la même façon, France
// comprise : le prix produit n'inclut plus de livraison "cachée".
export async function getShippingSurcharges(): Promise<ShippingRates> {
  const [france, europe, horsEurope] = await Promise.all([
    readAmount(KEYS.france),
    readAmount(KEYS.europe),
    readAmount(KEYS.horsEurope),
  ]);
  return { france, europe, horsEurope };
}

export async function setShippingSurcharges(amounts: ShippingRates): Promise<void> {
  await Promise.all([
    writeAmount(KEYS.france, amounts.france),
    writeAmount(KEYS.europe, amounts.europe),
    writeAmount(KEYS.horsEurope, amounts.horsEurope),
  ]);
}

// Montant à ajouter en supplément pour une adresse donnée.
export async function getSurchargeForCountry(country: string | null | undefined): Promise<number> {
  const zone = getShippingZone(country);
  const rates = await getShippingSurcharges();
  return rates[zone];
}
