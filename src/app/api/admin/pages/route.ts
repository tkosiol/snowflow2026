import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await prisma.page.findMany({
    include: { translations: true },
    orderBy: { slug: "asc" },
  });

  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { pageId, locale, title, content } = body;

    if (!pageId || !locale) {
      return NextResponse.json(
        { error: "pageId and locale are required" },
        { status: 400 }
      );
    }

    const translation = await prisma.pageTranslation.upsert({
      where: { pageId_locale: { pageId, locale } },
      create: { pageId, locale, title: title ?? "", content: content ?? "" },
      update: { title: title ?? "", content: content ?? "" },
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error("Upsert page translation error:", error);
    return NextResponse.json(
      { error: "Failed to save page translation" },
      { status: 400 }
    );
  }
}
