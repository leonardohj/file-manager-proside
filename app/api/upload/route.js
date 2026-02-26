import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const currentPath = formData.get("currentPath") || ""; // <- recebe a pasta atual

    if (!file) return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folderPath = path.join(process.cwd(), "public", currentPath);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const filePath = path.join(folderPath, file.name);
    fs.writeFileSync(filePath, buffer);

    return new Response(JSON.stringify({ success: true, url: `/conteudos/${currentPath ? currentPath + "/" : ""}${file.name}` }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}