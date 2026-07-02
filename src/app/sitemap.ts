import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://noubliejamais.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/boutique`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/composer`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/listen/demo`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/cgv`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
