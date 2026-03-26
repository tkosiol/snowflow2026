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

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.bookingInquiry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete inquiry error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, status, personCount, notes } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const allowedStatuses = ["NEW", "CONTACTED", "PAID", "CLOSED"];
    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = status;
    }
    if (personCount !== undefined) {
      const pc = Number(personCount);
      if (!Number.isInteger(pc) || pc < 1 || pc > 100) {
        return NextResponse.json({ error: "Invalid personCount" }, { status: 400 });
      }
      data.personCount = pc;
    }
    if (notes !== undefined) {
      if (typeof notes !== "string" || notes.length > 5000) {
        return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
      }
      data.notes = notes;
    }

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
