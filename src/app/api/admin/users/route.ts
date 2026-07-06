import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hashPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Liste des comptes (équipe).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, name: true, createdAt: true },
  });
  return NextResponse.json({ users, meId: session.id });
}

// Ajout d'un nouveau membre de l'équipe.
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const username = String(body.username ?? "").trim();
  const name = String(body.name ?? "").trim().slice(0, 80);
  const password = String(body.password ?? "");

  if (username.length < 3) {
    return NextResponse.json({ error: "L'identifiant doit faire au moins 3 caractères" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });
  }

  const taken = await prisma.adminUser.findUnique({ where: { username } });
  if (taken) {
    return NextResponse.json({ error: "Cet identifiant est déjà utilisé" }, { status: 409 });
  }

  const user = await prisma.adminUser.create({
    data: { username, name, passwordHash: hashPassword(password) },
    select: { id: true, username: true, name: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, user });
}
