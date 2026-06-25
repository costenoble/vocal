import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ ready: false });

  const message = await prisma.message.findUnique({
    where: { stripeSessionId: sessionId },
    select: { slug: true, fromName: true, toName: true },
  });

  if (!message) return NextResponse.json({ ready: false });

  return NextResponse.json({
    ready: true,
    slug: message.slug,
    fromName: message.fromName,
    toName: message.toName,
  });
}
