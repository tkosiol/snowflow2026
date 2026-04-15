import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function validatePassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 });
    }

    if (!password || !validatePassword(password)) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen und eine Zahl enthalten." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: { resetToken: token },
    });

    if (!admin || !admin.resetTokenExpiry) {
      return NextResponse.json(
        { error: "Der Reset-Link ist ungültig oder bereits verwendet." },
        { status: 400 }
      );
    }

    if (new Date() > admin.resetTokenExpiry) {
      return NextResponse.json(
        { error: "Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Fehler beim Zurücksetzen." }, { status: 500 });
  }
}
