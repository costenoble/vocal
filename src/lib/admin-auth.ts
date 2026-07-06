import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE = "nj_admin";

export interface AdminIdentity {
  id: string;
  username: string;
  name: string;
}

// ── Hachage des mots de passe (scrypt natif, aucune dépendance) ───────────────
// Format stocké : "salt(hex):dérivé(hex)".
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// ── Amorçage : au premier accès, s'il n'existe aucun compte, on en crée un à
// partir des variables d'environnement (ou admin/admin par défaut) pour que la
// connexion existante continue de fonctionner sans configuration. ─────────────
export async function ensureBootstrapAdmin(): Promise<void> {
  const count = await prisma.adminUser.count();
  if (count > 0) return;
  const username = process.env.ADMIN_USER ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? process.env.ADMIN_KEY ?? "admin";
  await prisma.adminUser.create({
    data: { username, name: "Administrateur", passwordHash: hashPassword(password) },
  });
}

// ── Jeton de session ──────────────────────────────────────────────────────────
// Cookie = "id:signature" où signature = HMAC(passwordHash, id). Le hash n'est
// jamais envoyé au client : impossible à forger. Changer le mot de passe change
// le hash, donc invalide automatiquement les sessions de cet utilisateur.
function signSession(user: { id: string; passwordHash: string }): string {
  const sig = createHmac("sha256", user.passwordHash).update(user.id).digest("hex");
  return `${user.id}:${sig}`;
}

export async function verifyLogin(username: string, password: string): Promise<AdminIdentity | null> {
  await ensureBootstrapAdmin();
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, username: user.username, name: user.name };
}

export async function sessionTokenForUsername(username: string): Promise<string | null> {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  return user ? signSession(user) : null;
}

// Renvoie l'admin connecté (ou null) à partir du cookie de session.
export async function getAdminSession(): Promise<AdminIdentity | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const [id, sig] = token.split(":");
  if (!id || !sig) return null;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) return null;
  const expected = createHmac("sha256", user.passwordHash).update(user.id).digest("hex");
  if (!safeEqual(sig, expected)) return null;
  return { id: user.id, username: user.username, name: user.name };
}

export async function isAdminSession(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

// Recalcule le jeton de session pour un utilisateur (après changement de mot de
// passe ou d'identifiant : garde l'admin connecté avec un cookie à jour).
export async function sessionTokenForId(id: string): Promise<string | null> {
  const user = await prisma.adminUser.findUnique({ where: { id } });
  return user ? signSession(user) : null;
}
