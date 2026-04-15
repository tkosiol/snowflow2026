import { getTranslations } from "next-intl/server";
import { alternateLanguages } from "@/lib/config";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("impressum")} | Snowflow`,
    alternates: {
      languages: alternateLanguages("/impressum"),
    },
  };
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {de ? "Impressum" : "Legal Notice"}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-[#455d94]" />

        <div className="mt-10 space-y-10 text-[#45464d] leading-relaxed">
          {/* Angaben */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Angaben gemäß § 5 TMG" : "Legal Notice according to § 5 TMG"}
            </h2>
            <p>
              Snowflow-Reisen<br />
              Ronald Korsch<br />
              Grunewaldstr. 27<br />
              12165 Berlin-Steglitz
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Kontakt" : "Contact"}
            </h2>
            <p>
              Tel.: 0179-1095619<br />
              E-Mail: info@snowflow.de
            </p>
          </div>

          {/* Verantwortlich */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de
                ? "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV"
                : "Responsible for content according to § 55 Abs. 2 RStV"}
            </h2>
            <p>
              Ronald Korsch<br />
              Grunewaldstr. 27<br />
              12165 Berlin-Steglitz
            </p>
          </div>

          {/* Gerichtsstand */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Gerichtsstand" : "Place of Jurisdiction"}
            </h2>
            <p>
              {de
                ? "Amtsgericht Berlin-Schöneberg"
                : "Local Court Berlin-Schöneberg"}
            </p>
          </div>

          {/* Haftung Inhalte */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Haftung für Inhalte" : "Liability for Content"}
            </h2>
            <p>
              {de
                ? "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen."
                : "The contents of our pages were created with the utmost care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content. As a service provider, we are responsible for our own content on these pages in accordance with § 7 para. 1 TMG under general law. However, according to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity."}
            </p>
          </div>

          {/* Haftung Links */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Haftung für Links" : "Liability for Links"}
            </h2>
            <p>
              {de
                ? "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar."
                : "Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the linked pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognisable at the time of linking."}
            </p>
          </div>

          {/* Urheberrecht */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "Urheberrecht" : "Copyright"}
            </h2>
            <p>
              {de
                ? "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet."
                : "The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, and any form of commercialisation of such material beyond the scope of copyright law require the written consent of the respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use."}
            </p>
          </div>

          <p className="text-sm italic text-[#45464d]">
            {de ? "Stand: April 2026" : "Last updated: April 2026"}
          </p>
        </div>
      </div>
    </section>
  );
}
