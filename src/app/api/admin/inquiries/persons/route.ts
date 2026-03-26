import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { inquiryId, firstName, lastName, dateOfBirth } = await request.json();

    if (!inquiryId || typeof inquiryId !== "string") {
      return NextResponse.json({ error: "inquiryId required" }, { status: 400 });
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "firstName and lastName required" }, { status: 400 });
    }

    const person = await prisma.bookingPerson.create({
      data: {
        inquiryId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || "",
      },
    });

    // Update personCount
    const count = await prisma.bookingPerson.count({ where: { inquiryId } });
    await prisma.bookingInquiry.update({
      where: { id: inquiryId },
      data: { personCount: count },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Create person error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to create person" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const person = await prisma.bookingPerson.findUnique({ where: { id } });
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    await prisma.bookingPerson.delete({ where: { id } });

    // Update personCount
    const count = await prisma.bookingPerson.count({ where: { inquiryId: person.inquiryId } });
    await prisma.bookingInquiry.update({
      where: { id: person.inquiryId },
      data: { personCount: count },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete person error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to delete person" }, { status: 400 });
  }
}
