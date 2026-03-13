import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GalleryPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });

  const description =
    locale === "de"
      ? "Bilder und Eindruecke von Snowflow Ski- und Snowboardreisen. Schau dir an, was dich erwartet!"
      : "Photos and impressions from Snowflow ski and snowboard trips. See what awaits you!";

  return {
    title: t("title"),
    description,
    openGraph: {
      title: `${t("title")} | Snowflow`,
      description,
    },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale } = await params;
  const t = await getTranslations("gallery");

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ season: "desc" }, { sortOrder: "asc" }],
  });

  const seasons = [...new Set(images.map((img) => img.season))];

  if (images.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("noImages")}</p>
      </main>
    );
  }

  const galleryImages = images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    alt: img.alt,
    season: img.season,
  }));

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      <GalleryGrid images={galleryImages} seasons={seasons} />
    </main>
  );
}
