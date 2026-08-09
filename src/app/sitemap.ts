import type { MetadataRoute } from "next";
import { getPublishedSongSlugs } from "@/lib/songs";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const slugs = await getPublishedSongSlugs();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/nomor`, changeFrequency: "monthly", priority: 0.5 },
    ...slugs.map((slug) => ({
      url: `${base}/lagu/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
