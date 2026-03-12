import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { TripCard } from "@/components/trips/trip-card";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TripsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("trips");

  const trips = await prisma.trip.findMany({
    where: { status: "PUBLISHED" },
    include: {
      translations: {
        where: { locale },
      },
    },
    orderBy: { departureDate: "asc" },
  });

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const translation = trip.translations[0];
              return (
                <TripCard
                  key={trip.id}
                  trip={{
                    id: trip.id,
                    slug: trip.slug,
                    destination: trip.destination,
                    departureDate: trip.departureDate.toISOString(),
                    returnDate: trip.returnDate.toISOString(),
                    priceEur: trip.priceEur,
                    imageUrl: trip.imageUrl,
                    translation: {
                      title: translation?.title ?? trip.destination,
                      subtitle: translation?.subtitle ?? "",
                    },
                  }}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t("noTrips")}</p>
        )}
      </div>
    </section>
  );
}
