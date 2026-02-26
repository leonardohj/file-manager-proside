import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req) {
  const { folderName, currentPath } = await req.json();
  if (!folderName) return new Response(JSON.stringify({ error: "No folder name" }), { status: 400 });

  // Usa currentPath se existir, senão cria em "conteudos"
  const folderPath = path.join(process.cwd(), "public", currentPath || "conteudos", folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    return new Response(JSON.stringify({ success: true, folder: folderName, path: currentPath || "conteudos" }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: "Folder already exists" }), { status: 400 });
  }
}