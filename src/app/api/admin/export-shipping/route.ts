import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  const v = value.replace(/"/g, '""');
  return /[",;\n]/.test(v) ? `"${v}"` : v;
}

// Export des commandes à expédier au format d'import en masse ColiShip
// (Nom, Adresse, Complément, Code postal, Ville, Pays, Référence).
// À utiliser dans coliship.laposte.fr → Import de commandes.
export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const orders = await prisma.message.findMany({
    where: { paid: true, shippedAt: null, shipAddress: { not: null } },
    orderBy: { createdAt: "asc" },
  });

  const header = [
    "Reference",
    "Nom destinataire",
    "Adresse",
    "Complement",
    "Code postal",
    "Ville",
    "Pays",
    "Contenu",
  ];

  const rows = orders.map((m) => [
    m.slug,
    m.shipName ?? "",
    m.shipAddress ?? "",
    m.shipComplement ?? "",
    m.shipPostalCode ?? "",
    m.shipCity ?? "",
    m.shipCountry ?? "France",
    m.productName ?? "Bracelet N'OUBLIE JAMAIS",
  ]);

  const csv =
    "﻿" + // BOM pour un affichage correct des accents dans Excel
    [header, ...rows].map((r) => r.map(csvEscape).join(";")).join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expeditions-${date}.csv"`,
    },
  });
}
