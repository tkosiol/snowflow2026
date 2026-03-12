import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { TripCard } from "@/components/trips/trip-card";
import { HeroVideo } from "@/components/layout/hero-video";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

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
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative z-10 flex flex-col items-center text-center text-white px-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium text-white/90 sm:text-xl md:text-2xl drop-shadow">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105"
              render={<Link href="#trips" />}
            >
              {t("hero.cta")}
            </Button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <ArrowDown className="size-6 text-white/60" />
        </div>
      </section>

      {/* About Teaser */}
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Since 2000
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("home.aboutTitle")}
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground">
            {t("home.aboutText")}
          </p>
        </div>
      </section>

      {/* Trip Cards Grid */}
      <section id="trips" className="scroll-mt-20 bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {locale === "de" ? "Bereit zum Abheben?" : "Ready to go?"}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("home.tripsTitle")}
            </h2>
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
            <p className="text-center text-muted-foreground">{t("home.noTrips")}</p>
          )}
        </div>
      </section>
    </>
  );
}
