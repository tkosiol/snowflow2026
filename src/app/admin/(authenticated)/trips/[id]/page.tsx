import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditTripClient } from "./edit-client";
import type { TripSection, BookingStatus } from "@/lib/validations";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!trip) {
    notFound();
  }

  const deTranslation = trip.translations.find((t) => t.locale === "de");
  const enTranslation = trip.translations.find((t) => t.locale === "en");

  const initialData = {
    slug: trip.slug,
    status: trip.status as "DRAFT" | "PUBLISHED",
    bookingStatus: trip.bookingStatus as BookingStatus,
    departureDate: trip.departureDate.toISOString().split("T")[0],
    returnDate: trip.returnDate.toISOString().split("T")[0],
    priceEur: trip.priceEur,
    destination: trip.destination,
    imageUrl: trip.imageUrl ?? "",
    translations: {
      de: {
        title: deTranslation?.title ?? "",
        subtitle: deTranslation?.subtitle ?? "",
        description: deTranslation?.description ?? "",
        sections: (deTranslation?.sections as TripSection[]) ?? [],
      },
      en: {
        title: enTranslation?.title ?? "",
        subtitle: enTranslation?.subtitle ?? "",
        description: enTranslation?.description ?? "",
        sections: (enTranslation?.sections as TripSection[]) ?? [],
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reise bearbeiten</h1>
      <EditTripClient id={id} initialData={initialData} />
    </div>
  );
}
