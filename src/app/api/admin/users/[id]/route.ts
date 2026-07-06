import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Suppression d'un membre de l'équipe. On ne peut pas se supprimer soi-même,
// ni supprimer le dernier compte (sinon plus aucun accès possible).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  const total = await prisma.adminUser.count();
  if (total <= 1) {
    return NextResponse.json({ error: "Impossible de supprimer le dernier compte" }, { status: 400 });
  }

  try {
    await prisma.adminUser.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
