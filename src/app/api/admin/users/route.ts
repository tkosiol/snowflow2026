import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admins = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "E-Mail, Name und Passwort sind erforderlich." },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ein Admin mit dieser E-Mail existiert bereits." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Admins." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID ist erforderlich." },
        { status: 400 }
      );
    }

    const adminToDelete = await prisma.admin.findUnique({ where: { id } });
    if (!adminToDelete) {
      return NextResponse.json(
        { error: "Admin nicht gefunden." },
        { status: 404 }
      );
    }

    if (adminToDelete.email === session.user.email) {
      return NextResponse.json(
        { error: "Du kannst dich nicht selbst löschen." },
        { status: 400 }
      );
    }

    if (adminToDelete.email === "admin@snowflow.de") {
      return NextResponse.json(
        { error: "Der Haupt-Admin kann nicht gelöscht werden." },
        { status: 400 }
      );
    }

    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Admins." },
      { status: 500 }
    );
  }
}
