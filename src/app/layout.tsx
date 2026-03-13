import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://snowflow.tillkosiol.de"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
