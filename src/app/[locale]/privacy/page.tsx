import { getTranslations } from "next-intl/server";
import { alternateLanguages } from "@/lib/config";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("privacy")} | Snowflow`,
    alternates: {
      languages: alternateLanguages("/privacy"),
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const de = locale === "de";

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {de ? "Datenschutzerklärung" : "Privacy Policy"}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-[#455d94]" />

        <div className="mt-10 space-y-10 text-[#45464d] leading-relaxed">
          {/* 1 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "1. Verantwortlicher" : "1. Controller"}
            </h2>
            <p>
              Snowflow<br />
              [Vor- und Nachname des Verantwortlichen]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              E-Mail: info@snowflow.de
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "2. Buchungsanfragen" : "2. Booking Inquiries"}
            </h2>
            <p className="mb-4">
              {de
                ? "Wenn du über unser Buchungsformular eine Anfrage stellst, erheben wir folgende Daten:"
                : "When you submit a booking inquiry through our form, we collect the following data:"}
            </p>
            <ul className="space-y-1.5 mb-4">
              {(de
                ? [
                    "Vorname, Nachname",
                    "E-Mail-Adresse",
                    "Telefonnummer",
                    "Geburtsdatum",
                    "Anschrift (Straße, PLZ, Ort)",
                    "Anzahl der Personen",
                    "Anmerkungen (freiwillig)",
                  ]
                : [
                    "First name, last name",
                    "Email address",
                    "Phone number",
                    "Date of birth",
                    "Address (street, postal code, city)",
                    "Number of persons",
                    "Remarks (optional)",
                  ]
              ).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#455d94]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mb-2">
              <strong className="text-[#0f1a37]">
                {de ? "Rechtsgrundlage:" : "Legal basis:"}
              </strong>{" "}
              {de
                ? "Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen)."
                : "Art. 6(1)(b) GDPR (performance of pre-contractual measures)."}
            </p>
            <p className="mb-2">
              <strong className="text-[#0f1a37]">
                {de ? "Zweck:" : "Purpose:"}
              </strong>{" "}
              {de
                ? "Bearbeitung deiner Buchungsanfrage und Kontaktaufnahme."
                : "Processing your booking inquiry and contacting you."}
            </p>
            <p>
              <strong className="text-[#0f1a37]">
                {de ? "Speicherdauer:" : "Storage duration:"}
              </strong>{" "}
              {de
                ? "Deine Daten werden für die Dauer der Reiseplanung und anschließend gemäß den gesetzlichen Aufbewahrungsfristen (bis zu 10 Jahre nach Handels- und Steuerrecht) gespeichert."
                : "Your data will be stored for the duration of trip planning and subsequently in accordance with statutory retention periods (up to 10 years under commercial and tax law)."}
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "3. E-Mail-Benachrichtigungen" : "3. Email Notifications"}
            </h2>
            <p className="mb-2">
              {de
                ? "Bei Eingang einer Buchungsanfrage wird eine Benachrichtigung per E-Mail an uns gesendet. Dazu werden deine Anfragedaten über den E-Mail-Dienst Resend (Resend Inc., USA) übermittelt."
                : "When a booking inquiry is received, a notification is sent to us via email. Your inquiry data is transmitted via the email service Resend (Resend Inc., USA)."}
            </p>
            <p>
              <strong className="text-[#0f1a37]">
                {de ? "Rechtsgrundlage:" : "Legal basis:"}
              </strong>{" "}
              {de
                ? "Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der zeitnahen Bearbeitung von Anfragen)."
                : "Art. 6(1)(f) GDPR (legitimate interest in timely processing of inquiries)."}
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "4. Admin-Bereich" : "4. Admin Area"}
            </h2>
            <p className="mb-2">
              {de
                ? "Für den internen Verwaltungsbereich speichern wir Zugangsdaten (E-Mail, Name, verschlüsseltes Passwort) unserer Administratoren. Der Zugang ist durch Authentifizierung geschützt. Sessions werden als verschlüsselte JWT-Tokens im Browser gespeichert."
                : "For the internal administration area, we store access credentials (email, name, encrypted password) of our administrators. Access is protected by authentication. Sessions are stored as encrypted JWT tokens in the browser."}
            </p>
            <p>
              <strong className="text-[#0f1a37]">
                {de ? "Rechtsgrundlage:" : "Legal basis:"}
              </strong>{" "}
              {de
                ? "Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Betrieb der Website)."
                : "Art. 6(1)(f) GDPR (legitimate interest in operating the website)."}
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "5. Hosting" : "5. Hosting"}
            </h2>
            <p className="mb-2">
              {de
                ? "Diese Website wird auf einem Virtual Private Server (VPS) bei Netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Deutschland gehostet. Beim Aufruf der Website werden automatisch Informationen in sogenannten Server-Log-Dateien gespeichert, die dein Browser übermittelt (z.B. IP-Adresse, Datum und Uhrzeit des Zugriffs, angeforderte Seite)."
                : "This website is hosted on a Virtual Private Server (VPS) at Netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Germany. When accessing the website, information is automatically stored in server log files transmitted by your browser (e.g. IP address, date and time of access, requested page)."}
            </p>
            <p>
              <strong className="text-[#0f1a37]">
                {de ? "Rechtsgrundlage:" : "Legal basis:"}
              </strong>{" "}
              {de
                ? "Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung und Sicherheit der Website)."
                : "Art. 6(1)(f) GDPR (legitimate interest in providing and securing the website)."}
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "6. Cookies" : "6. Cookies"}
            </h2>
            <p>
              {de
                ? "Diese Website verwendet nur technisch notwendige Cookies für die Admin-Session-Verwaltung. Es werden keine Tracking-, Analyse- oder Marketing-Cookies eingesetzt."
                : "This website uses only technically necessary cookies for admin session management. No tracking, analytics, or marketing cookies are used."}
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "7. Keine Analyse- oder Tracking-Tools" : "7. No Analytics or Tracking Tools"}
            </h2>
            <p>
              {de
                ? "Wir verwenden keine Analyse-Tools wie Google Analytics, Matomo oder ähnliche Dienste. Es findet kein Tracking deines Nutzungsverhaltens statt."
                : "We do not use any analytics tools such as Google Analytics, Matomo, or similar services. There is no tracking of your browsing behaviour."}
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "8. Deine Rechte" : "8. Your Rights"}
            </h2>
            <p className="mb-4">
              {de
                ? "Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:"
                : "You have the following rights regarding your personal data:"}
            </p>
            <ul className="space-y-1.5 mb-4">
              {(de
                ? [
                    ["Auskunft", "(Art. 15 DSGVO): Du kannst Auskunft über deine gespeicherten Daten verlangen."],
                    ["Berichtigung", "(Art. 16 DSGVO): Du kannst die Berichtigung unrichtiger Daten verlangen."],
                    ["Löschung", "(Art. 17 DSGVO): Du kannst die Löschung deiner Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen."],
                    ["Einschränkung", "(Art. 18 DSGVO): Du kannst die Einschränkung der Verarbeitung verlangen."],
                    ["Datenübertragbarkeit", "(Art. 20 DSGVO): Du kannst deine Daten in einem gängigen Format erhalten."],
                    ["Widerspruch", "(Art. 21 DSGVO): Du kannst der Verarbeitung widersprechen."],
                  ]
                : [
                    ["Access", "(Art. 15 GDPR): You can request information about your stored data."],
                    ["Rectification", "(Art. 16 GDPR): You can request correction of inaccurate data."],
                    ["Erasure", "(Art. 17 GDPR): You can request deletion of your data, provided no statutory retention obligations apply."],
                    ["Restriction", "(Art. 18 GDPR): You can request restriction of processing."],
                    ["Data portability", "(Art. 20 GDPR): You can receive your data in a common format."],
                    ["Objection", "(Art. 21 GDPR): You can object to data processing."],
                  ]
              ).map(([label, text]) => (
                <li key={label} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#455d94]" />
                  <span>
                    <strong className="text-[#0f1a37]">{label}</strong> {text}
                  </span>
                </li>
              ))}
            </ul>
            <p>
              {de
                ? "Zur Ausübung deiner Rechte genügt eine E-Mail an "
                : "To exercise your rights, simply send an email to "}
              <strong className="text-[#0f1a37]">info@snowflow.de</strong>.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "9. Beschwerderecht" : "9. Right to Complain"}
            </h2>
            <p className="mb-2">
              {de
                ? "Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die für uns zuständige Aufsichtsbehörde ist:"
                : "You have the right to lodge a complaint with a data protection supervisory authority. The authority responsible for us is:"}
            </p>
            <p>
              {de
                ? "Berliner Beauftragte für Datenschutz und Informationsfreiheit"
                : "Berlin Commissioner for Data Protection and Freedom of Information"}
              <br />
              Alt-Moabit 59-61<br />
              10555 Berlin
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1a37] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {de ? "10. Änderungen" : "10. Changes"}
            </h2>
            <p>
              {de
                ? "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen."
                : "We reserve the right to update this privacy policy to ensure it always complies with current legal requirements or to reflect changes in our services."}
            </p>
          </div>

          <p className="text-sm italic text-[#45464d]">
            {de ? "Stand: März 2026" : "Last updated: March 2026"}
          </p>
        </div>
      </div>
    </section>
  );
}
