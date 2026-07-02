import Image from "next/image";

interface LogoProps {
  size?: number;
}

// Logo officiel N'OUBLIE JAMAIS (traits dorés, fond transparent) — fonctionne
// sur fonds clairs comme sombres. Source : public/logo.png (720×715).
export default function Logo({ size = 110 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="N'OUBLIE JAMAIS"
      width={size}
      height={Math.round(size * (715 / 720))}
      style={{ display: "block" }}
    />
  );
}
