import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/config";

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trips = await prisma.trip.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/trips", priority: 0.9 },
    { path: "/booking", priority: 0.8 },
    { path: "/gallery", priority: 0.7 },
    { path: "/about", priority: 0.5 },
    { path: "/impressum", priority: 0.3 },
    { path: "/privacy", priority: 0.3 },
  ];

  const locales = ["de", "en"];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
        ),
      },
    }))
  );

  const tripEntries: MetadataRoute.Sitemap = trips.flatMap((trip) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/trips/${trip.slug}`,
      lastModified: trip.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/trips/${trip.slug}`])
        ),
      },
    }))
  );

  return [...staticEntries, ...tripEntries];
}
