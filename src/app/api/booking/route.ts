import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { sendBookingNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { translations: { where: { locale: "de" } } },
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
        dateOfBirth: data.dateOfBirth,
        street: data.street,
        postalCode: data.postalCode,
        city: data.city,
        personCount: data.personCount ?? 1,
        remarks: data.remarks ?? "",
      },
    });

    try {
      await sendBookingNotification({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        street: data.street,
        postalCode: data.postalCode,
        city: data.city,
        tripTitle: trip.translations[0]?.title ?? trip.destination,
        remarks: data.remarks ?? "",
      });
    } catch (emailError) {
      console.error("Failed to send booking notification email:", emailError instanceof Error ? emailError.message : "Unknown error");
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
