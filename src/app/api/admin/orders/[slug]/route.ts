import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteAudio } from "@/lib/storage";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Marquer une commande expédiée (ou annuler) depuis l'admin.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const { shipped } = await req.json().catch(() => ({ shipped: true }));

  try {
    await prisma.message.update({
      where: { slug },
      data: { shippedAt: shipped === false ? null : new Date() },
    });
  } catch {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// Suppression d'une commande depuis l'admin : l'enregistrement ET ses
// fichiers audio (message + éventuelle réponse) sont effacés.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const message = await prisma.message.findUnique({
    where: { slug },
    select: { audioUrl: true, replyAudioUrl: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  await deleteAudio(message.audioUrl);
  if (message.replyAudioUrl) await deleteAudio(message.replyAudioUrl);
  await prisma.message.delete({ where: { slug } });

  return NextResponse.json({ ok: true });
}
