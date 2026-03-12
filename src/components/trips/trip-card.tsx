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

interface TripCardProps {
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
    <Card className="flex h-full flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
        {trip.imageUrl ? (
          <Image
            src={trip.imageUrl}
            alt={trip.translation.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sky-400 to-blue-600" />
        )}
      </div>
      <CardHeader>
        <CardTitle>{trip.translation.title}</CardTitle>
        {trip.translation.subtitle && (
          <CardDescription>{trip.translation.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="text-muted-foreground">
          <p>
            {t("departure")}: {formatDate(trip.departureDate)}
          </p>
          <p>
            {t("return")}: {formatDate(trip.returnDate)}
          </p>
        </div>
        <p className="mt-auto text-lg font-semibold">
          {t("from")} {trip.priceEur}&nbsp;&euro; {t("perPerson")}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/trips/${trip.slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            {t("details")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
