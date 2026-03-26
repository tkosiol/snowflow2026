import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
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
  const t = await getTranslations({ locale, namespace: "nav" });

  const page = await prisma.page.findUnique({
    where: { slug: "about" },
    include: { translations: { where: { locale } } },
  });

  const content = page?.translations[0]?.content;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {page?.translations[0]?.title || t("about")}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-[#455d94]" />

        <div className="mt-10 text-[#45464d] leading-relaxed">
          {content ? (
            <p className="whitespace-pre-line">{content}</p>
          ) : (
            <p className="text-muted-foreground">
              {locale === "de"
                ? "Inhalt wird bald hinzugefügt."
                : "Content coming soon."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
