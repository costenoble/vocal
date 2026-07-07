import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS : uniquement pertinent derrière HTTPS (Vercel/prod)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Le micro n'est utilisé que par notre propre composer
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    // Les pages HTML interactives ne doivent jamais être servies "périmées"
    // par le CDN Hostinger : par défaut Next leur applique un cache d'un an
    // (s-maxage=31536000), ce qui fait qu'après un déploiement le navigateur
    // charge un vieux HTML référençant des fichiers JS supprimés → la page ne
    // s'hydrate plus (boutons/connexion inertes). On force la revalidation
    // (ETag) : contenu toujours frais, sans casser le cache des assets
    // /_next/static (content-hashés, immuables), non ciblés ici.
    const noStaleCache = { key: "Cache-Control", value: "public, max-age=0, must-revalidate" };
    const pageRoutes = ["/", "/boutique", "/boutique/:slug", "/composer", "/success", "/cancel", "/listen/demo"];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...pageRoutes.map((source) => ({ source, headers: [noStaleCache] })),
    ];
  },
};

export default nextConfig;
