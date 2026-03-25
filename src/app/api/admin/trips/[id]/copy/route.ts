import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const original = await prisma.trip.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const copy = await prisma.trip.create({
      data: {
        slug: `${original.slug}-copy`,
        status: "DRAFT",
        bookingStatus: original.bookingStatus,
        departureDate: original.departureDate,
        returnDate: original.returnDate,
        priceEur: original.priceEur,
        destination: original.destination,
        imageUrl: original.imageUrl,
        translations: {
          create: original.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            subtitle: t.subtitle,
            description: t.description,
            sections: t.sections as object,
          })),
        },
      },
      include: { translations: true },
    });

    return NextResponse.json(copy, { status: 201 });
  } catch (error) {
    console.error("Copy trip error:", error);
    return NextResponse.json(
      { error: "Failed to copy trip" },
      { status: 400 }
    );
  }
}
