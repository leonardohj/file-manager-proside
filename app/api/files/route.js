import fs from "fs";
import path from "path";

export const runtime = "nodejs";

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
    const filter = searchParams.get("filter") || "all"; // "all", "folders", "images", "videos", "az", "za"

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
      if (stats.isFile() && file.endsWith(".meta.json")) continue;

      if (stats.isDirectory()) {
        const size = getFolderSize(fullPath);
        folders.push({
          name: file,
          type: "folder",
          path: path.join(currentPath, file),
          url: `/${path.join(currentPath, file).replace(/\\/g, "/")}`,
          extension: "folder",
          size,
          sizeFormatted: formatBytes(size)
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
          size,
          sizeFormatted: formatBytes(size)
        });
      }
    }

    // aplicar filtro apenas se não for "az" ou "za"
    let result = [];

    if (filter === "folders") {
      result = folders;
    } else if (filter === "images") {
      result = files.filter(f => f.type === "image");
    } else if (filter === "videos") {
      result = files.filter(f => f.type === "video");
    } else {
      result = [...folders, ...files];
    }
    
    if (filter === "az" || filter === "za") {
      result.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return filter === "za"
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      });
    } else {
      result.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    return new Response(JSON.stringify({ files: result }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Cannot read folder" }), { status: 500 });
  }
}