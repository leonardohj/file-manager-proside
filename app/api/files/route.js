import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// função recursiva para calcular o tamanho de uma pasta
function getFolderSize(folderPath) {
  const entries = fs.readdirSync(folderPath);
  let total = 0;

  for (const file of entries) {
    const fullPath = path.join(folderPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      total += getFolderSize(fullPath);
    } else {
      total += stats.size;
    }
  }

  return total;
}

// função para formatar bytes
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const currentPath = searchParams.get("path") || "conteudos";

    const safeBasePath = path.join(process.cwd(), "public");
    const folderPath = path.join(safeBasePath, currentPath);

    if (!folderPath.startsWith(safeBasePath)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), { status: 400 });
    }

    if (!fs.existsSync(folderPath)) {
      return new Response(JSON.stringify({ error: "Folder not found" }), { status: 404 });
    }

    const entries = fs.readdirSync(folderPath);

    const folders = [];
    const files = [];

    for (const file of entries) {
      const fullPath = path.join(folderPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const size = getFolderSize(fullPath);
        folders.push({
          name: file,
          type: "folder",
          path: path.join(currentPath, file),
          url: `/${path.join(currentPath, file).replace(/\\/g, "/")}`,
          extension: "folder",
          size, // em bytes
          sizeFormatted: formatBytes(size) // legível
        });
      } else {
        const ext = file.includes(".")
          ? file.split(".").pop().toLowerCase()
          : "unknown";

        let type = "other";

        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) type = "image";
        if (["mp4", "mov", "webm", "avi"].includes(ext)) type = "video";

        const size = stats.size;

        files.push({
          name: file,
          url: `/${path.join(currentPath, file).replace(/\\/g, "/")}`,
          type,
          path: path.join(currentPath, file),
          extension: ext,
          size, // em bytes
          sizeFormatted: formatBytes(size) // legível
        });
      }
    }

    const result = [...folders, ...files];

    return new Response(JSON.stringify({ files: result }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Cannot read folder" }), { status: 500 });
  }
}