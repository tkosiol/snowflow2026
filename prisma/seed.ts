import "dotenv/config";
import bcrypt from "bcryptjs";

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    // Create admin user
    const passwordHash = await bcrypt.hash("snowflow2026", 10);
    await prisma.admin.upsert({
      where: { email: "admin@snowflow.de" },
      update: {},
      create: {
        email: "admin@snowflow.de",
        passwordHash,
        name: "Admin",
      },
    });
    console.log("Admin user created: admin@snowflow.de / snowflow2026");

    // Create trips
    const slovenia = await prisma.trip.upsert({
      where: { slug: "slowenien-2026" },
      update: {},
      create: {
        slug: "slowenien-2026",
        status: "PUBLISHED",
        departureDate: new Date("2026-01-16"),
        returnDate: new Date("2026-01-21"),
        priceEur: 399,
        destination: "Kranjska Gora, Slowenien",
        translations: {
          create: [
            {
              locale: "de",
              title: "Skiurlaub Slowenien",
              subtitle: "Kranjska Gora - Julische Alpen",
              description:
                "Erlebe 5 Tage Wintersport in den Julischen Alpen Sloweniens! Kranjska Gora bietet hervorragende Pisten für Anfänger und Fortgeschrittene, dazu gemütliche Hütten und ein tolles Après-Ski-Erlebnis.",
              includedItems: [
                "Busfahrt ab/bis Berlin",
                "5x Übernachtung mit Frühstück",
                "4-Tages-Skipass",
                "Reiseleitung vor Ort",
              ],
              locationInfo:
                "Kranjska Gora liegt in den Julischen Alpen im Nordwesten Sloweniens, direkt an der Grenze zu Österreich und Italien. Das Skigebiet bietet 20 km Pisten auf bis zu 1.215 m Höhe.",
              accommodationInfo:
                "Unterkunft in einem gemütlichen Hotel im Zentrum von Kranjska Gora. Doppel- und Mehrbettzimmer mit Frühstücksbuffet.",
              logisticsInfo:
                "Abfahrt Freitagabend ab Berlin ZOB. Ankunft Samstagmorgen. Rückfahrt Mittwochabend, Ankunft Donnerstagmorgen in Berlin.",
            },
            {
              locale: "en",
              title: "Ski Trip Slovenia",
              subtitle: "Kranjska Gora - Julian Alps",
              description:
                "Experience 5 days of winter sports in Slovenia's Julian Alps! Kranjska Gora offers excellent slopes for beginners and intermediates, plus cozy mountain huts and great après-ski.",
              includedItems: [
                "Bus transfer from/to Berlin",
                "5 nights with breakfast",
                "4-day ski pass",
                "On-site tour guide",
              ],
              locationInfo:
                "Kranjska Gora is located in the Julian Alps in northwestern Slovenia, right on the border with Austria and Italy. The ski area offers 20 km of slopes up to 1,215 m altitude.",
              accommodationInfo:
                "Accommodation in a cozy hotel in the center of Kranjska Gora. Double and multi-bed rooms with breakfast buffet.",
              logisticsInfo:
                "Departure Friday evening from Berlin ZOB. Arrival Saturday morning. Return Wednesday evening, arrival Thursday morning in Berlin.",
            },
          ],
        },
      },
    });

    const scuol = await prisma.trip.upsert({
      where: { slug: "scuol-2026" },
      update: {},
      create: {
        slug: "scuol-2026",
        status: "PUBLISHED",
        departureDate: new Date("2026-03-06"),
        returnDate: new Date("2026-03-14"),
        priceEur: 599,
        destination: "Scuol, Schweiz",
        translations: {
          create: [
            {
              locale: "de",
              title: "Skiurlaub Scuol",
              subtitle: "Engadin - Schweizer Alpen",
              description:
                "8 Tage Wintersport im wunderschönen Engadin! Scuol bietet abwechslungsreiche Pisten, traumhafte Panoramen und die berühmten Engadiner Thermalbäder zum Entspannen nach dem Skifahren.",
              includedItems: [
                "Busfahrt ab/bis Berlin",
                "8x Übernachtung mit Halbpension",
                "6-Tages-Skipass",
                "Zugang zu den Engadiner Thermalbädern",
                "Reiseleitung vor Ort",
              ],
              locationInfo:
                "Scuol liegt im Unterengadin in Graubünden, Schweiz. Das Skigebiet Motta Naluns bietet 80 km Pisten auf bis zu 2.783 m Höhe mit atemberaubendem Panoramablick.",
              accommodationInfo:
                "Unterkunft in einem traditionellen Engadiner Hotel. Doppel- und Mehrbettzimmer mit Halbpension (Frühstück und Abendessen).",
              logisticsInfo:
                "Abfahrt Freitagabend ab Berlin ZOB. Ankunft Samstagmorgen. Rückfahrt Samstag, Ankunft Sonntagmorgen in Berlin.",
            },
            {
              locale: "en",
              title: "Ski Trip Scuol",
              subtitle: "Engadin - Swiss Alps",
              description:
                "8 days of winter sports in the beautiful Engadin! Scuol offers varied slopes, stunning panoramas, and the famous Engadin thermal baths to relax after skiing.",
              includedItems: [
                "Bus transfer from/to Berlin",
                "8 nights with half board",
                "6-day ski pass",
                "Access to Engadin thermal baths",
                "On-site tour guide",
              ],
              locationInfo:
                "Scuol is located in the Lower Engadin in Graubünden, Switzerland. The Motta Naluns ski area offers 80 km of slopes up to 2,783 m altitude with breathtaking panoramic views.",
              accommodationInfo:
                "Accommodation in a traditional Engadin hotel. Double and multi-bed rooms with half board (breakfast and dinner).",
              logisticsInfo:
                "Departure Friday evening from Berlin ZOB. Arrival Saturday morning. Return Saturday, arrival Sunday morning in Berlin.",
            },
          ],
        },
      },
    });

    console.log("Trips created:", slovenia.slug, scuol.slug);

    // Create CMS pages
    const pages = [
      { slug: "about", titleDe: "Über uns", titleEn: "About us" },
      { slug: "impressum", titleDe: "Impressum", titleEn: "Imprint" },
      { slug: "privacy", titleDe: "Datenschutz", titleEn: "Privacy Policy" },
    ];

    for (const p of pages) {
      await prisma.page.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          slug: p.slug,
          translations: {
            create: [
              { locale: "de", title: p.titleDe, content: "" },
              { locale: "en", title: p.titleEn, content: "" },
            ],
          },
        },
      });
    }
    console.log("CMS pages created");

    await prisma.$disconnect();
  } catch (e) {
    await prisma.$disconnect();
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
