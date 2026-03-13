import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Delete inquiries first (no cascade set)
    await prisma.bookingInquiry.deleteMany({ where: { tripId: id } });
    // Then delete the trip (translations cascade)
    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Permanent delete trip error:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 400 }
    );
  }
}
