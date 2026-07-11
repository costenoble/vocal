import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Horodatages des commandes payées — sert à la cloche de notification de
// l'admin (badge « nouvelles commandes » + alerte temps réel).
export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const paid = await prisma.message.findMany({
    where: { paid: true },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { createdAt: true, fromName: true, toName: true },
  });

  return NextResponse.json({
    timestamps: paid.map((m) => m.createdAt.getTime()),
    latest: paid[0] ? { at: paid[0].createdAt.getTime(), fromName: paid[0].fromName, toName: paid[0].toName } : null,
  });
}
