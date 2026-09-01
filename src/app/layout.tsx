import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://oubliejamaisbijoux.fr";
const DESCRIPTION =
  "Enregistrez votre message vocal et offrez un souvenir unique à ceux que vous aimez.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "N'OUBLIE JAMAIS.NJ — Les émotions prennent une voix",
    template: "%s · N'OUBLIE JAMAIS.NJ",
  },
  description: DESCRIPTION,
  openGraph: {
    siteName: "N'OUBLIE JAMAIS.NJ",
    type: "website",
    locale: "fr_FR",
    title: "N'OUBLIE JAMAIS.NJ — Les émotions prennent une voix",
    description: DESCRIPTION,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "N'OUBLIE JAMAIS.NJ — Les émotions prennent une voix",
    description: DESCRIPTION,
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full" style={{ background: "var(--cream)" }}>
        <SplashScreen>{children}</SplashScreen>
      </body>
    </html>
  );
}
