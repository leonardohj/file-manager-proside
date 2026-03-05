import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { folderName, currentPath } = await req.json();
    if (!folderName) return new Response(JSON.stringify({ error: "No folder name" }), { status: 400 });

    const safeFolderNameBase = folderName.replace(/[/\\?%*:|"<>]/g, "_");
    let safeFolderName = safeFolderNameBase;

    const basePath = path.join(process.cwd(), "public", currentPath || "conteudos");
    let folderPath = path.join(basePath, safeFolderName);

    // Add counter if folder already exists
    let counter = 1;
    while (fs.existsSync(folderPath)) {
      safeFolderName = `${safeFolderNameBase} (${counter})`;
      folderPath = path.join(basePath, safeFolderName);
      counter++;
    }

    fs.mkdirSync(folderPath, { recursive: true });

    return new Response(JSON.stringify({
      success: true,
      folder: safeFolderName,
      path: currentPath || "conteudos"
    }), { status: 200 });
  } catch (err) {
    console.error("Erro ao criar pasta:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}