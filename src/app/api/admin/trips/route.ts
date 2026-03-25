import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trips = await prisma.trip.findMany({
    include: { translations: true },
    orderBy: { departureDate: "desc" },
  });

  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = tripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        slug: data.slug,
        status: data.status,
        bookingStatus: data.bookingStatus,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        priceEur: data.priceEur,
        destination: data.destination,
        imageUrl: data.imageUrl || null,
        translations: {
          create: [
            {
              locale: "de",
              title: data.translations.de.title,
              subtitle: data.translations.de.subtitle,
              description: data.translations.de.description,
              sections: data.translations.de.sections as object[],
            },
            {
              locale: "en",
              title: data.translations.en.title,
              subtitle: data.translations.en.subtitle,
              description: data.translations.en.description,
              sections: data.translations.en.sections as object[],
            },
          ],
        },
      },
      include: { translations: true },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Create trip error:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 400 }
    );
  }
}
