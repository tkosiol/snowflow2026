import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  bookingStatus: z.enum(["AVAILABLE", "ALMOST_FULL", "FULL"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { bookingStatus } = schema.parse(body);

    await prisma.trip.update({
      where: { id },
      data: { bookingStatus },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 400 }
    );
  }
}
