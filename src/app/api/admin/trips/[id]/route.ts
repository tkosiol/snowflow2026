import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const data = tripSchema.parse(body);

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        slug: data.slug,
        status: data.status,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        priceEur: data.priceEur,
        destination: data.destination,
        imageUrl: data.imageUrl || null,
        translations: {
          upsert: [
            {
              where: { tripId_locale: { tripId: id, locale: "de" } },
              create: { locale: "de", ...data.translations.de },
              update: data.translations.de,
            },
            {
              where: { tripId_locale: { tripId: id, locale: "en" } },
              create: { locale: "en", ...data.translations.en },
              update: data.translations.en,
            },
          ],
        },
      },
      include: { translations: true },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Update trip error:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 400 }
    );
  }
}

// Soft delete: move to archive
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.trip.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Archive trip error:", error);
    return NextResponse.json(
      { error: "Failed to archive trip" },
      { status: 400 }
    );
  }
}
