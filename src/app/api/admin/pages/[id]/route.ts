import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { locale, title, content } = body;

    if (!locale) {
      return NextResponse.json(
        { error: "locale is required" },
        { status: 400 }
      );
    }

    const translation = await prisma.pageTranslation.upsert({
      where: { pageId_locale: { pageId: id, locale } },
      create: { pageId: id, locale, title: title ?? "", content: content ?? "" },
      update: { title: title ?? "", content: content ?? "" },
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 400 }
    );
  }
}
