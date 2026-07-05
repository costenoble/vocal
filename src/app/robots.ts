import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://oubliejamaisbijoux.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages privées (messages personnels) et techniques
      disallow: ["/listen/", "/admin", "/api/", "/success", "/cancel"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
