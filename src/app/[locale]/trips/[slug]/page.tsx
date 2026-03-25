import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
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

  return {
    title: `${trip.translations[0].title} - Snowflow`,
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

  return (
    <main>
      <TripDetail trip={tripData} />
    </main>
  );
}
