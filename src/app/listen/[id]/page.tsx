import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ListenClient from "./ListenClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const msg = await prisma.message.findUnique({ where: { slug: id } });
  if (!msg) return { title: "Message introuvable" };

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://votre-domaine.com";

  return {
    title: `Message de ${msg.fromName} pour ${msg.toName} — N'OUBLIE JAMAIS`,
    description: `Un message vocal unique, enregistré avec amour.`,
    // Message privé : jamais indexé par les moteurs de recherche.
    robots: { index: false, follow: false },
    openGraph: {
      title: `Un message de ${msg.fromName} pour ${msg.toName}`,
      description: `Scannez ou cliquez pour écouter ce message vocal unique.`,
      images: [
        {
          url: `${origin}/api/og/${id}`,
          width: 1200,
          height: 630,
          alt: `Message de ${msg.fromName} pour ${msg.toName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Un message de ${msg.fromName} pour ${msg.toName}`,
      images: [`${origin}/api/og/${id}`],
    },
  };
}

export default async function ListenPage({ params }: Props) {
  const { id } = await params;
  const message = await prisma.message.findUnique({ where: { slug: id } });

  if (!message) notFound();

  // Check expiration
  const expired = message.expiresAt ? new Date() > new Date(message.expiresAt) : false;

  if (!expired) {
    await prisma.message.update({
      where: { slug: id },
      data: { viewCount: { increment: 1 } },
    });
  }

  // Le champ `date` est un texte libre ("Notre mariage · 25 juin 2026") : on
  // l'affiche tel quel. Seul l'ancien format ISO (yyyy-mm-dd) est reformaté.
  const dateFormatted = (() => {
    if (!message.date) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(message.date)) {
      const d = new Date(message.date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      }
    }
    return message.date;
  })();

  // If the message is protected by an access code, do NOT ship the audio URL
  // to the browser — the client requests it after verifying the code.
  const locked = !!message.accessCode && !expired;

  return (
    <ListenClient
      slug={message.slug}
      fromName={message.fromName}
      toName={message.toName}
      date={dateFormatted}
      audioUrl={locked ? "" : message.audioUrl}
      duration={message.duration ?? undefined}
      expired={expired}
      locked={locked}
      theme={message.theme}
      replyAudioUrl={locked ? undefined : message.replyAudioUrl ?? undefined}
      replyFromName={locked ? undefined : message.replyFromName ?? undefined}
    />
  );
}
