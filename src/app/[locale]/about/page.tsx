import { getTranslations } from "next-intl/server";
import { alternateLanguages } from "@/lib/config";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "de"
      ? "Erfahre mehr über Snowflow - Berlins Ski- & Snowboard-Community seit 2000."
      : "Learn more about Snowflow - Berlin's ski & snowboard community since 2000.";
  return {
    title: `${t("about")} | Snowflow`,
    description,
    openGraph: { title: `${t("about")} | Snowflow`, description },
    alternates: {
      languages: alternateLanguages("/about"),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {de ? "Über uns" : "About us"}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-[#455d94]" />

        <div className="mt-10 space-y-10 text-[#45464d] leading-relaxed">

          {/* Greeting */}
          <p className="text-lg italic text-[#0f1a37]">
            {de
              ? "Liebe Skifahrer, Snowboarder, Wintersportler und Schneesportverrückte!"
              : "Dear skiers, snowboarders, winter sports enthusiasts and snow sport fanatics!"}
          </p>

          {/* Who / What is Snowflow */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Wer oder was ist Snowflow?" : "Who or what is Snowflow?"}
            </h2>
            <p className="mb-4">
              {de
                ? "Snowflow ist eine kleine, stark wachsende Berliner Ski & Snowboard-Community, die es sich zum Ziel gemacht hat, gemeinsam preiswerte Ski- und Snowboardreisen in eigener Regie durchzuführen. Die erste Snowflow-Reise gab es bereits im Jahr 2000."
                : "Snowflow is a small but rapidly growing Berlin-based ski & snowboard community, dedicated to organising affordable ski and snowboard trips together. The first Snowflow trip took place back in the year 2000."}
            </p>
            <p className="mb-4">
              {de
                ? "Snowflow bleibt bewusst und gewollt eher klein und grenzt sich mit seinem Angebot von großen kommerziellen Reiseveranstaltern ab."
                : "Snowflow deliberately stays small and sets itself apart from large commercial travel operators."}
            </p>
            <p>
              {de
                ? "Alle Snowflower teilen eine passionierte Leidenschaft für den Wintersport und möchten gerne andere mit dem Snowflow-Virus anstecken."
                : "All Snowflowers share a passionate love for winter sports and want to spread the Snowflow virus to others."}
            </p>
          </div>

          {/* Our trips */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Unsere Reisen" : "Our trips"}
            </h2>
            <p className="mb-4">
              {de
                ? "Unsere Reisen zeichnen sich durch folgende Dinge aus:"
                : "Our trips are defined by the following:"}
            </p>
            <ul className="space-y-1.5 mb-4 list-disc pl-5 marker:text-[#455d94]">
              {(de
                ? [
                    "Einfache aber gemütliche Unterkünfte — häufig direkt an der Piste",
                    "Gutes und reichliches Essen",
                    "Erkundung des jeweiligen Skigebiets mit all seinen Facetten und Möglichkeiten",
                    "Fokus auf dem Freeriden abseits der überfüllten Pisten — mit Sicherheit und Geländekunde als oberste Priorität",
                  ]
                : [
                    "Simple but cosy accommodation — often right on the slopes",
                    "Good and plentiful food",
                    "Exploration of each ski resort with all its facets and possibilities",
                    "A focus on freeriding off the crowded pistes — with safety and terrain knowledge as the top priority",
                  ]
              ).map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
            <p>
              {de
                ? "Über allem steht das Erlebnis des gemeinsamen Skifahrens und Boardens mit Freunden und Gästen — die zu Freunden werden."
                : "Above all, it's about the experience of skiing and boarding together with friends and guests — who become friends."}
            </p>
          </div>

          {/* Closing */}
          <div>
            <p className="mb-4">
              {de
                ? "Und selbstverständlich wird jeder gelungene Powder-Tag am Abend gebührend gefeiert!"
                : "And of course, every great powder day is celebrated in style come evening!"}
            </p>
            <p className="text-lg font-semibold text-[#0f1a37]">
              {de
                ? "Wenn euch diese Zeilen angesprochen haben — kommt mit auf eine unserer Reisen!"
                : "If this sounds like you — come join us on one of our trips!"}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
