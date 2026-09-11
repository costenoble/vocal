import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { getShippingSurcharge, setShippingSurcharge } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const shippingSurcharge = await getShippingSurcharge();
  return NextResponse.json({ shippingSurcharge });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const amount = Number(body.shippingSurcharge);
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  await setShippingSurcharge(amount);
  return NextResponse.json({ ok: true, shippingSurcharge: amount });
}
