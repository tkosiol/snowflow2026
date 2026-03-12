"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  imageUrl: string;
  alt: string;
  season: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  seasons: string[];
}

export function GalleryGrid({ images, seasons }: GalleryGridProps) {
  const t = useTranslations("gallery");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const imagesBySeason = (season: string) =>
    images.filter((img) => img.season === season);

  return (
    <>
      <Tabs defaultValue={seasons[0] ?? "all"}>
        <TabsList>
          {seasons.map((season) => (
            <TabsTrigger key={season} value={season}>
              {season}
            </TabsTrigger>
          ))}
        </TabsList>

        {seasons.map((season) => (
          <TabsContent key={season} value={season}>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {imagesBySeason(season).map((image) => (
                <button
                  key={image.id}
                  type="button"
                  className="mb-4 block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.alt}
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Lightbox */}
      <Dialog
        open={selectedImage !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogContent className="max-w-4xl sm:max-w-4xl">
          <DialogTitle className="sr-only">
            {selectedImage?.alt || t("title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedImage?.alt || t("title")}
          </DialogDescription>
          {selectedImage && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.alt}
                fill
                className="rounded-lg object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
