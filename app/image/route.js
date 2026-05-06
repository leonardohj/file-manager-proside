import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file"); // e.g., "conteudos/a.png"

  if (!file) {
    return new NextResponse("NO IMAGE FOUND", { status: 404 });
  }

  const cleanFile = file.replace(/^\/+/, "");
  const fullPath = path.join(process.cwd(), "public", cleanFile);

  if (!fs.existsSync(fullPath)) {
    return new NextResponse("NO IMAGE FOUND", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(fullPath);

  // Determine MIME type based on file extension
  const ext = path.extname(cleanFile).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".png") contentType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".gif") contentType = "image/gif";
  else if (ext === ".webp") contentType = "image/webp";

  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": contentType }
  });
}