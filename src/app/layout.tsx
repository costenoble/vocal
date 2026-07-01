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

export const metadata: Metadata = {
  title: "N'OUBLIE JAMAIS — Un souvenir qui traverse le temps",
  description:
    "Enregistrez votre message vocal et offrez un souvenir unique à ceux que vous aimez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full" style={{ background: "var(--cream)" }}>
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
