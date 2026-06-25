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

  const dateFormatted = (() => {
    try {
      return new Date(message.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return message.date;
    }
  })();

  return (
    <ListenClient
      fromName={message.fromName}
      toName={message.toName}
      date={dateFormatted}
      audioUrl={message.audioUrl}
      duration={message.duration ?? undefined}
      expired={expired}
    />
  );
}
