import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  getAdminSession,
  verifyPassword,
  hashPassword,
  sessionTokenForId,
  ADMIN_COOKIE,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Modification de son propre compte : nom, identifiant et/ou mot de passe.
// Le mot de passe actuel est exigé pour toute modification sensible.
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newUsername = body.username !== undefined ? String(body.username).trim() : undefined;
  const newName = body.name !== undefined ? String(body.name).trim().slice(0, 80) : undefined;
  const newPassword = body.newPassword !== undefined ? String(body.newPassword) : undefined;

  const me = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!me) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const wantsSensitive = newUsername !== undefined || newPassword !== undefined;
  if (wantsSensitive) {
    if (!verifyPassword(currentPassword, me.passwordHash)) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 403 });
    }
  }

  const data: Record<string, unknown> = {};

  if (newName !== undefined) data.name = newName;

  if (newUsername !== undefined) {
    if (newUsername.length < 3) {
      return NextResponse.json({ error: "L'identifiant doit faire au moins 3 caractères" }, { status: 400 });
    }
    const taken = await prisma.adminUser.findUnique({ where: { username: newUsername } });
    if (taken && taken.id !== me.id) {
      return NextResponse.json({ error: "Cet identifiant est déjà utilisé" }, { status: 409 });
    }
    data.username = newUsername;
  }

  if (newPassword !== undefined) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });
    }
    data.passwordHash = hashPassword(newPassword);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }

  await prisma.adminUser.update({ where: { id: me.id }, data });

  // Le mot de passe (donc la signature de session) a pu changer : on rafraîchit
  // le cookie pour ne pas déconnecter l'admin qui vient de se modifier.
  const token = await sessionTokenForId(me.id);
  if (token) {
    const store = await cookies();
    store.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return NextResponse.json({ ok: true });
}
