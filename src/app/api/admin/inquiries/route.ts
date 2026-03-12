import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inquiries = await prisma.bookingInquiry.findMany({
    include: {
      trip: {
        include: { translations: { where: { locale: "de" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, status, personCount, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (personCount !== undefined) data.personCount = personCount;
    if (notes !== undefined) data.notes = notes;

    const inquiry = await prisma.bookingInquiry.update({
      where: { id },
      data,
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Update inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 400 }
    );
  }
}
