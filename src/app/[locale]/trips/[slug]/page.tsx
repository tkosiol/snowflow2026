import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SITE_URL, alternateLanguages } from "@/lib/config";
import { TripDetail } from "@/components/trips/trip-detail";
import type { TripSection, BookingStatus } from "@/lib/validations";

interface TripPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: TripPageProps) {
  const { locale, slug } = await params;

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { locale },
      },
    },
  });

  if (!trip || trip.translations.length === 0) {
    return {};
  }

  const translation = trip.translations[0];
  const title = translation.title;
  const description =
    translation.description ||
    (locale === "de"
      ? `${title} - Ski- & Snowboardreise mit Snowflow ab ${trip.priceEur}€ pro Person.`
      : `${title} - Ski & snowboard trip with Snowflow from ${trip.priceEur}€ per person.`);

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Snowflow`,
      description,
      ...(trip.imageUrl ? { images: [{ url: trip.imageUrl }] } : {}),
    },
    alternates: {
      languages: alternateLanguages(`/trips/${slug}`),
    },
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations("trips");

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { locale },
      },
    },
  });

  if (!trip || trip.translations.length === 0) {
    notFound();
  }

  const translation = trip.translations[0];

  const tripData = {
    id: trip.id,
    slug: trip.slug,
    destination: trip.destination,
    departureDate: trip.departureDate.toISOString(),
    returnDate: trip.returnDate.toISOString(),
    priceEur: trip.priceEur,
    bookingStatus: trip.bookingStatus as BookingStatus,
    imageUrl: trip.imageUrl,
    translation: {
      title: translation.title,
      subtitle: translation.subtitle,
      description: translation.description,
      sections: (translation.sections as TripSection[]) ?? [],
    },
  };

  const tripSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: translation.title,
    description: translation.description || translation.subtitle,
    startDate: trip.departureDate.toISOString(),
    endDate: trip.returnDate.toISOString(),
    location: {
      "@type": "Place",
      name: trip.destination,
    },
    organizer: {
      "@type": "Organization",
      name: "Snowflow",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: trip.priceEur,
      priceCurrency: "EUR",
      availability:
        trip.bookingStatus === "FULL"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/${locale}/booking?trip=${trip.slug}`,
    },
    ...(trip.imageUrl ? { image: trip.imageUrl } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripSchema) }}
      />
      <TripDetail trip={tripData} />
    </main>
  );
}
