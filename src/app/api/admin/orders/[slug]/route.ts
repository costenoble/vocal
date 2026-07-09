import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteAudio } from "@/lib/storage";
import { isAdminSession } from "@/lib/admin-auth";
import { sendShippingNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

// Marquer une commande expédiée (ou annuler) depuis l'admin. Un numéro de
// suivi optionnel déclenche l'email d'expédition au client.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => ({ shipped: true }));
  const shipped = body.shipped;
  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  const carrier = typeof body.carrier === "string" ? body.carrier.trim() : "";

  let updated;
  try {
    updated = await prisma.message.update({
      where: { slug },
      data: {
        shippedAt: shipped === false ? null : new Date(),
        ...(shipped === false
          ? { trackingNumber: null, trackingCarrier: null }
          : trackingNumber
            ? { trackingNumber, trackingCarrier: carrier || null }
            : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // Email d'expédition au client si un numéro de suivi est fourni.
  let emailSent = false;
  if (shipped !== false && trackingNumber && updated.buyerEmail) {
    try {
      await sendShippingNotification({
        to: updated.buyerEmail,
        toName: updated.toName,
        productName: updated.productName ?? undefined,
        trackingNumber,
        carrier: carrier || undefined,
      });
      emailSent = true;
    } catch (err) {
      console.error("[orders] shipping email failed", err);
    }
  }

  return NextResponse.json({ ok: true, emailSent });
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
