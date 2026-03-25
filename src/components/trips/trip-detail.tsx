"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CalendarDays } from "lucide-react";

interface TripSection {
  id: string;
  title: string;
  type: "text" | "list" | "list-price";
  content: string;
  priceItems: { name: string; price: number }[];
  position: number;
}

type BookingStatus = "AVAILABLE" | "ALMOST_FULL" | "FULL";

interface TripDetailProps {
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
      description: string;
      sections: TripSection[];
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

function SectionCard({ section }: { section: TripSection }) {
  if (section.type === "text") {
    return (
      <div>
        <h2 className="mb-3 text-xl font-bold text-[#0f1a37]" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <p className="whitespace-pre-line leading-relaxed text-[#45464d]">
          {section.content}
        </p>
      </div>
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
        <h2 className="mb-3 text-xl font-bold text-[#0f1a37]" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-[#45464d]">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#455d94]" />
              {item}
            </li>
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
        <h2 className="mb-3 text-xl font-bold text-[#0f1a37]" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-[0.5rem] bg-[#f2f3ff] px-4 py-2.5"
            >
              <span className="text-[#0f1a37]">{item.name}</span>
              <span className="font-semibold whitespace-nowrap text-[#0f1a37]">
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

  return (
    <>
      {/* Full-width Hero */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        {trip.imageUrl ? (
          <Image
            src={trip.imageUrl}
            alt={trip.translation.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: "linear-gradient(135deg, #04102c 0%, #1a2542 100%)" }}
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Title + Subtitle bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <h1
              className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {trip.translation.title}
            </h1>
            {trip.translation.subtitle && (
              <p className="mt-2 text-lg text-white/75 drop-shadow sm:text-xl">
                {trip.translation.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

          {/* Left: Description + Sections */}
          <div className="space-y-10 lg:col-span-2">
            {trip.translation.description && (
              <p className="whitespace-pre-line leading-relaxed text-[#45464d]">
                {trip.translation.description}
              </p>
            )}

            {sortedSections.length > 0 && (
              <div className="space-y-8">
                {sortedSections.map((section) => (
                  <SectionCard key={section.id} section={section} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Booking Box */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-[0.5rem] border border-[#c6c6ce] bg-white p-6"
              style={{ boxShadow: "0 24px 48px rgba(15, 26, 55, 0.06)" }}
            >
              {/* Price + Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="text-4xl font-bold text-[#0f1a37]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {trip.priceEur}&euro;
                  </span>
                  <p className="mt-1 text-sm text-[#45464d]">Pro Person</p>
                </div>
                <span
                  className={`inline-block rounded-[0.25rem] px-4 py-2 text-xs font-semibold ${
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

              {/* Divider */}
              <div className="my-5 border-t border-[#c6c6ce]" />

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#45464d]">
                  <CalendarDays className="size-4 shrink-0 text-[#455d94]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#45464d]">
                      {t("departure")}
                    </p>
                    <p className="font-medium text-[#0f1a37]">
                      {formatDate(trip.departureDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#45464d]">
                  <CalendarDays className="size-4 shrink-0 text-[#455d94]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#45464d]">
                      {t("return")}
                    </p>
                    <p className="font-medium text-[#0f1a37]">
                      {formatDate(trip.returnDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-[#c6c6ce]" />

              {/* CTA */}
              <Link
                href={`/booking?trip=${trip.slug}`}
                className="block w-full rounded-[0.25rem] bg-gradient-to-r from-[#04102c] to-[#1a2542] py-4 text-center text-lg font-bold text-white shadow-lg shadow-[#04102c]/20 transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
              >
                {t("bookNow")}
              </Link>
              <p className="mt-4 text-center text-[10px] font-medium uppercase italic tracking-tighter text-[#45464d]">
                Sichere dir deinen Platz im tiefen Schnee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
