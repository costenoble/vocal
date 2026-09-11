import { prisma } from "@/lib/prisma";

const SHIPPING_SURCHARGE_KEY = "shipping_surcharge_eur";

// Supplément de livraison hors France, réglable par l'admin (0 = désactivé).
// Le prix affiché sur le site inclut la livraison pour la France uniquement.
export async function getShippingSurcharge(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: SHIPPING_SURCHARGE_KEY } });
  const value = row ? Number(row.value) : 0;
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export async function setShippingSurcharge(amount: number): Promise<void> {
  const value = Math.max(0, Math.round(amount * 100) / 100).toString();
  await prisma.setting.upsert({
    where: { key: SHIPPING_SURCHARGE_KEY },
    create: { key: SHIPPING_SURCHARGE_KEY, value },
    update: { value },
  });
}

export function needsShippingSurcharge(country: string | null | undefined): boolean {
  return !!country && country.trim() !== "France";
}
