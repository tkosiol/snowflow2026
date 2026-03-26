import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve } from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const fileName = path.join("/");

  const baseDir = resolve(process.cwd(), "public", "uploads");
  const filePath = resolve(baseDir, fileName);

  // Prevent directory traversal — resolved path must stay inside uploads
  if (!filePath.startsWith(baseDir + "/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const ext = "." + fileName.split(".").pop()?.toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
