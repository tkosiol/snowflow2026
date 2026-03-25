import "dotenv/config";
import bcrypt from "bcryptjs";

function sectionId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeSections(
  de: { title: string; type: "text" | "list" | "list-price"; content?: string; priceItems?: { name: string; price: number }[] }[],
  en: { title: string; content?: string; priceItems?: { name: string; price: number }[] }[]
) {
  const ids = de.map(() => sectionId());
  const deSections = de.map((s, i) => ({
    id: ids[i],
    title: s.title,
    type: s.type,
    content: s.content ?? "",
    priceItems: s.priceItems ?? [],
    position: i,
  }));
  const enSections = en.map((s, i) => ({
    id: ids[i],
    title: s.title,
    type: de[i].type,
    content: s.content ?? "",
    priceItems: s.priceItems ?? [],
    position: i,
  }));
  return { deSections, enSections };
}

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

    // Slovenia sections
    const sloveniaS = makeSections(
      [
        { title: "Beschreibung", type: "text", content: "Erlebe 5 Tage Wintersport in den Julischen Alpen Sloweniens! Kranjska Gora bietet hervorragende Pisten für Anfänger und Fortgeschrittene, dazu gemütliche Hütten und ein tolles Après-Ski-Erlebnis." },
        { title: "Skigebiet", type: "text", content: "Kranjska Gora liegt in den Julischen Alpen im Nordwesten Sloweniens, direkt an der Grenze zu Österreich und Italien. Das Skigebiet bietet 20 km Pisten auf bis zu 1.215 m Höhe." },
        { title: "Unterkunft", type: "text", content: "Unterkunft in einem gemütlichen Hotel im Zentrum von Kranjska Gora. Doppel- und Mehrbettzimmer mit Frühstücksbuffet." },
        { title: "Anreise", type: "text", content: "Abfahrt Freitagabend ab Berlin ZOB. Ankunft Samstagmorgen. Rückfahrt Mittwochabend, Ankunft Donnerstagmorgen in Berlin." },
        { title: "Inklusivleistungen", type: "list", content: "Busfahrt ab/bis Berlin\n5x Übernachtung mit Frühstück\n4-Tages-Skipass\nReiseleitung vor Ort" },
      ],
      [
        { title: "Description", content: "Experience 5 days of winter sports in Slovenia's Julian Alps! Kranjska Gora offers excellent slopes for beginners and intermediates, plus cozy mountain huts and great après-ski." },
        { title: "Ski area", content: "Kranjska Gora is located in the Julian Alps in northwestern Slovenia, right on the border with Austria and Italy. The ski area offers 20 km of slopes up to 1,215 m altitude." },
        { title: "Accommodation", content: "Accommodation in a cozy hotel in the center of Kranjska Gora. Double and multi-bed rooms with breakfast buffet." },
        { title: "Travel", content: "Departure Friday evening from Berlin ZOB. Arrival Saturday morning. Return Wednesday evening, arrival Thursday morning in Berlin." },
        { title: "What's included", content: "Bus transfer from/to Berlin\n5 nights with breakfast\n4-day ski pass\nOn-site tour guide" },
      ]
    );

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
            { locale: "de", title: "Skiurlaub Slowenien", subtitle: "Kranjska Gora - Julische Alpen", sections: sloveniaS.deSections },
            { locale: "en", title: "Ski Trip Slovenia", subtitle: "Kranjska Gora - Julian Alps", sections: sloveniaS.enSections },
          ],
        },
      },
    });

    // Scuol sections
    const scuolS = makeSections(
      [
        { title: "Beschreibung", type: "text", content: "8 Tage Wintersport im wunderschönen Engadin! Scuol bietet abwechslungsreiche Pisten, traumhafte Panoramen und die berühmten Engadiner Thermalbäder zum Entspannen nach dem Skifahren." },
        { title: "Skigebiet", type: "text", content: "Scuol liegt im Unterengadin in Graubünden, Schweiz. Das Skigebiet Motta Naluns bietet 80 km Pisten auf bis zu 2.783 m Höhe mit atemberaubendem Panoramablick." },
        { title: "Unterkunft", type: "text", content: "Unterkunft in einem traditionellen Engadiner Hotel. Doppel- und Mehrbettzimmer mit Halbpension (Frühstück und Abendessen)." },
        { title: "Anreise", type: "text", content: "Abfahrt Freitagabend ab Berlin ZOB. Ankunft Samstagmorgen. Rückfahrt Samstag, Ankunft Sonntagmorgen in Berlin." },
        { title: "Inklusivleistungen", type: "list", content: "Busfahrt ab/bis Berlin\n8x Übernachtung mit Halbpension\n6-Tages-Skipass\nZugang zu den Engadiner Thermalbädern\nReiseleitung vor Ort" },
      ],
      [
        { title: "Description", content: "8 days of winter sports in the beautiful Engadin! Scuol offers varied slopes, stunning panoramas, and the famous Engadin thermal baths to relax after skiing." },
        { title: "Ski area", content: "Scuol is located in the Lower Engadin in Graubünden, Switzerland. The Motta Naluns ski area offers 80 km of slopes up to 2,783 m altitude with breathtaking panoramic views." },
        { title: "Accommodation", content: "Accommodation in a traditional Engadin hotel. Double and multi-bed rooms with half board (breakfast and dinner)." },
        { title: "Travel", content: "Departure Friday evening from Berlin ZOB. Arrival Saturday morning. Return Saturday, arrival Sunday morning in Berlin." },
        { title: "What's included", content: "Bus transfer from/to Berlin\n8 nights with half board\n6-day ski pass\nAccess to Engadin thermal baths\nOn-site tour guide" },
      ]
    );

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
            { locale: "de", title: "Skiurlaub Scuol", subtitle: "Engadin - Schweizer Alpen", sections: scuolS.deSections },
            { locale: "en", title: "Ski Trip Scuol", subtitle: "Engadin - Swiss Alps", sections: scuolS.enSections },
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
