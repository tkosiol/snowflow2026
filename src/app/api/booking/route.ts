import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    const locale = data.locale ?? "de";

    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { translations: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const inquiry = await prisma.bookingInquiry.create({
      data: {
        tripId: data.tripId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        street: data.street,
        postalCode: data.postalCode,
        city: data.city,
        personCount: data.persons.length,
        remarks: data.remarks ?? "",
        persons: {
          create: data.persons.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth,
          })),
        },
      },
    });

    const deTranslation = trip.translations.find((t) => t.locale === "de");
    const localeTranslation = trip.translations.find((t) => t.locale === locale);
    const tripTitle = deTranslation?.title ?? trip.destination;

    try {
      await sendBookingNotification({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        street: data.street,
        postalCode: data.postalCode,
        city: data.city,
        tripTitle,
        departureDate: trip.departureDate.toISOString(),
        returnDate: trip.returnDate.toISOString(),
        persons: data.persons,
        remarks: data.remarks ?? "",
      });
    } catch (emailError) {
      console.error("Failed to send booking notification email:", emailError instanceof Error ? emailError.message : "Unknown error");
    }

    try {
      await sendBookingConfirmation({
        firstName: data.firstName,
        email: data.email,
        tripTitle: localeTranslation?.title ?? tripTitle,
        departureDate: trip.departureDate.toISOString(),
        returnDate: trip.returnDate.toISOString(),
        personCount: data.persons.length,
        persons: data.persons,
        locale: locale as "de" | "en",
      });
    } catch (emailError) {
      console.error("Failed to send booking confirmation email:", emailError instanceof Error ? emailError.message : "Unknown error");
    }

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (error) {
    console.error("Booking error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create booking inquiry" },
      { status: 400 }
    );
  }
}
