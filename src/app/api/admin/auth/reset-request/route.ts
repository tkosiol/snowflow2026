import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: true });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.admin.update({
        where: { id: admin.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });

      const resetUrl = `${SITE_URL}/admin/reset-password?token=${token}`;
      await sendPasswordResetEmail(admin.email, resetUrl).catch((err) => {
        console.error("Failed to send password reset email:", err instanceof Error ? err.message : err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset request error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: true });
  }
}
