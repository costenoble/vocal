import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { getShippingSurcharges, setShippingSurcharges } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const shipping = await getShippingSurcharges();
  return NextResponse.json({ shipping });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const europe = Number(body.europe);
  const horsEurope = Number(body.horsEurope);
  if (!Number.isFinite(europe) || europe < 0 || !Number.isFinite(horsEurope) || horsEurope < 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  await setShippingSurcharges({ europe, horsEurope });
  return NextResponse.json({ ok: true, shipping: { europe, horsEurope } });
}
