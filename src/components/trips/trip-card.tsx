"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";

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
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TripCard({ trip }: TripCardProps) {
  const t = useTranslations("trips");

  return (
    <Link href={`/trips/${trip.slug}`} className="group block">
      <div
        className="overflow-hidden bg-white border border-transparent transition-all duration-300 group-hover:shadow-[0_32px_64px_rgba(15,26,55,0.12)] group-hover:border-[#455d94]"
        style={{
          borderRadius: "0.5rem",
          boxShadow: "0 24px 48px rgba(15, 26, 55, 0.06)",
        }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {trip.imageUrl ? (
            <Image
              src={trip.imageUrl}
              alt={trip.translation.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: "linear-gradient(135deg, #04102c 0%, #1a2542 100%)",
              }}
            />
          )}
        </div>

        {/* Card body */}
        <div className="p-5">
          {/* Title + Price */}
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-base font-bold leading-snug text-[#0f1a37]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {trip.translation.title}
            </h3>
            <div className="shrink-0 text-right">
              <p className="text-base font-bold text-[#0f1a37]">
                {trip.priceEur}&euro;
              </p>
              <p className="text-xs text-[#45464d]">Pro Person</p>
            </div>
          </div>

          {/* Location */}
          {trip.destination && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-[#45464d]">
              <MapPin className="size-3.5 shrink-0" />
              <span>{trip.destination}</span>
            </div>
          )}

          {/* Dates */}
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#45464d]">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>
              {formatDate(trip.departureDate)} &ndash;{" "}
              {formatDate(trip.returnDate)}
            </span>
          </div>

          {/* Details link */}
          <div className="mt-4 flex justify-end">
            <span className="flex items-center gap-1 text-sm font-medium text-[#455d94]">
              {t("details")}
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
