import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Snowflow - Ski- & Snowboardreisen aus Berlin seit 2000",
    template: "%s | Snowflow",
  },
  description:
    "Snowflow organisiert seit 2000 unvergessliche Ski- und Snowboardreisen ab Berlin. Gemeinsam auf die Piste - guenstig, unkompliziert und mit bester Community.",
  keywords: [
    "Skireisen",
    "Snowboardreisen",
    "Berlin",
    "Skiurlaub",
    "Snowflow",
    "guenstige Skireisen",
    "Ski Community Berlin",
    "Snowboard Community",
    "Winterurlaub",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Snowflow",
    title: "Snowflow - Ski- & Snowboardreisen aus Berlin seit 2000",
    description:
      "Seit 2000 organisiert Snowflow unvergessliche Ski- und Snowboardreisen ab Berlin. Gemeinsam auf die Piste!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snowflow - Ski- & Snowboardreisen aus Berlin seit 2000",
    description:
      "Seit 2000 organisiert Snowflow unvergessliche Ski- und Snowboardreisen ab Berlin. Gemeinsam auf die Piste!",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let lang = "de";
  try {
    lang = await getLocale();
  } catch {
    // Admin/API routes don't have locale context
  }
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Snowflow",
    url: SITE_URL,
    logo: `${SITE_URL}/images/snowflow-logo.svg`,
    description:
      "Snowflow organisiert seit 2000 Ski- und Snowboardreisen ab Berlin.",
    foundingDate: "2000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Berlin",
      addressCountry: "DE",
    },
    sameAs: [
      "https://www.instagram.com/snowflow.de",
      "https://www.facebook.com/snowflow.de",
    ],
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
