"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TripSection {
  id: string;
  title: string;
  type: "text" | "list" | "list-price";
  content: string;
  priceItems: { name: string; price: number }[];
  position: number;
}

interface TripDetailProps {
  trip: {
    id: string;
    slug: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    priceEur: number;
    imageUrl: string | null;
    translation: {
      title: string;
      subtitle: string;
      sections: TripSection[];
    };
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function SectionCard({ section }: { section: TripSection }) {
  if (section.type === "text") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{section.title}</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-line">
          {section.content}
        </CardContent>
      </Card>
    );
  }

  if (section.type === "list") {
    const items = section.content
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return null;

    return (
      <div>
        <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.type === "list-price") {
    const items = section.priceItems ?? [];
    if (items.length === 0) return null;

    return (
      <div>
        <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5"
            >
              <span className="text-foreground">{item.name}</span>
              <span className="font-semibold whitespace-nowrap">
                {item.price.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                &nbsp;&euro;
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

export function TripDetail({ trip }: TripDetailProps) {
  const t = useTranslations("trips");

  const sortedSections = [...trip.translation.sections].sort(
    (a, b) => a.position - b.position
  );

  // Separate card-type sections (text) from block-type sections (list, list-price)
  const cardSections = sortedSections.filter(
    (s) => s.type === "text" && s.content
  );
  const blockSections = sortedSections.filter(
    (s) =>
      (s.type === "list" && s.content.trim()) ||
      (s.type === "list-price" && (s.priceItems?.length ?? 0) > 0)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Hero image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
        {trip.imageUrl ? (
          <Image
            src={trip.imageUrl}
            alt={trip.translation.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sky-400 to-blue-600" />
        )}
      </div>

      {/* Title & subtitle */}
      <div>
        <h1 className="text-3xl font-bold">{trip.translation.title}</h1>
        {trip.translation.subtitle && (
          <p className="mt-2 text-lg text-muted-foreground">
            {trip.translation.subtitle}
          </p>
        )}
      </div>

      {/* Dates & price */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary">
          {t("departure")}: {formatDate(trip.departureDate)}
        </Badge>
        <Badge variant="secondary">
          {t("return")}: {formatDate(trip.returnDate)}
        </Badge>
        <Badge variant="default">
          {trip.priceEur}&nbsp;&euro; {t("perPerson")}
        </Badge>
      </div>

      <Separator />

      {/* Text-type sections as cards */}
      {cardSections.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {cardSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* List and list-price sections */}
      {blockSections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}

      <Separator />

      {/* CTA */}
      <div className="flex justify-center">
        <Link href={`/booking?trip=${trip.slug}`}>
          <Button size="lg" className="text-base">
            {t("bookNow")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
