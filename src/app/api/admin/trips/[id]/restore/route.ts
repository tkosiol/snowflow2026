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
    await prisma.trip.update({
      where: { id },
      data: { status: "DRAFT" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Restore trip error:", error);
    return NextResponse.json(
      { error: "Failed to restore trip" },
      { status: 400 }
    );
  }
}
