"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

export interface TripCardProps {
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

export function TripCard({ trip }: TripCardProps) {
  const t = useTranslations("trips");

  return (
    <Link href={`/trips/${trip.slug}`} className="group block">
      <Card className="h-full overflow-hidden border-0 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {trip.imageUrl ? (
            <Image
              src={trip.imageUrl}
              alt={trip.translation.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600" />
          )}
          {/* Price badge */}
          <div className="absolute bottom-3 right-3 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground shadow-lg">
            {t("from")} {trip.priceEur}&euro;
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{trip.translation.title}</CardTitle>
          {trip.translation.subtitle && (
            <CardDescription className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {trip.translation.subtitle}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span>
              {formatDate(trip.departureDate)} &ndash; {formatDate(trip.returnDate)}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            className="w-full font-semibold"
          >
            {t("details")}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
