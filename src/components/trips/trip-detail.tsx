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
      description: string;
      includedItems: string[];
      locationInfo: string;
      accommodationInfo: string;
      logisticsInfo: string;
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

export function TripDetail({ trip }: TripDetailProps) {
  const t = useTranslations("trips");

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

      {/* Description */}
      {trip.translation.description && (
        <div className="prose prose-sm max-w-none whitespace-pre-line">
          {trip.translation.description}
        </div>
      )}

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {trip.translation.locationInfo && (
          <Card>
            <CardHeader>
              <CardTitle>{t("location")}</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {trip.translation.locationInfo}
            </CardContent>
          </Card>
        )}

        {trip.translation.accommodationInfo && (
          <Card>
            <CardHeader>
              <CardTitle>{t("accommodation")}</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {trip.translation.accommodationInfo}
            </CardContent>
          </Card>
        )}

        {trip.translation.logisticsInfo && (
          <Card>
            <CardHeader>
              <CardTitle>{t("logistics")}</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {trip.translation.logisticsInfo}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Included items */}
      {trip.translation.includedItems.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">{t("included")}</h2>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            {trip.translation.includedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

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
