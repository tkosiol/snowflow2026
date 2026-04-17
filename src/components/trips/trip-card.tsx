"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";

type BookingStatus = "AVAILABLE" | "ALMOST_FULL" | "FULL";

export interface TripCardProps {
  trip: {
    id: string;
    slug: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    priceEur: number;
    bookingStatus: BookingStatus;
    imageUrl: string | null;
    translation: {
      title: string;
      subtitle: string;
    };
  };
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TripCard({ trip }: TripCardProps) {
  const t = useTranslations("trips");
  const locale = useLocale();

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
          <span
            className={`absolute top-3 right-3 rounded-[0.25rem] px-3 py-1.5 text-xs font-semibold shadow-sm ${
              trip.bookingStatus === "AVAILABLE"
                ? "bg-[#e8f5e9] text-[#2e7d32]"
                : trip.bookingStatus === "ALMOST_FULL"
                  ? "bg-[#fff8e1] text-[#f57f17]"
                  : "bg-[#ffebee] text-[#c62828]"
            }`}
          >
            {trip.bookingStatus === "AVAILABLE"
              ? t("statusAvailable")
              : trip.bookingStatus === "ALMOST_FULL"
                ? t("statusAlmostFull")
                : t("statusFull")}
          </span>
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
              <p className="text-xs text-[#45464d]">{t("perPerson")}</p>
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
              {formatDate(trip.departureDate, locale)} &ndash;{" "}
              {formatDate(trip.returnDate, locale)}
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
