import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { TripCard } from "@/components/trips/trip-card";
import { HeroVideo } from "@/components/layout/hero-video";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations();

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
    <>
      {/* Hero Section */}
      <section className="relative flex h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-primary">
        <HeroVideo />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" render={<Link href="/trips" />}>
              {t("hero.cta")}
            </Button>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t("home.aboutTitle")}
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {t("home.aboutText")}
        </p>
      </section>

      {/* Trip Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
          {t("home.tripsTitle")}
        </h2>
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <p className="text-muted-foreground">{t("home.noTrips")}</p>
        )}
      </section>
    </>
  );
}
