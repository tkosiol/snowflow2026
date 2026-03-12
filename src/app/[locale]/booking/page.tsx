import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking/booking-form";

interface BookingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });

  return {
    title: `${t("title")} - Snowflow`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { locale } = await params;
  const t = await getTranslations("booking");

  const trips = await prisma.trip.findMany({
    where: { status: "PUBLISHED" },
    include: {
      translations: {
        where: { locale },
        select: { title: true },
      },
    },
    orderBy: { departureDate: "asc" },
  });

  const tripsForForm = trips.map((trip) => ({
    id: trip.id,
    title: trip.translations[0]?.title ?? trip.destination,
    slug: trip.slug,
  }));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Suspense>
        <BookingForm trips={tripsForForm} />
      </Suspense>
    </main>
  );
}
