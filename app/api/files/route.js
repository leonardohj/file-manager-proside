import fs from "fs";
import path from "path";

export const runtime = "nodejs";

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

    const files = fs.readdirSync(folderPath).map((file) => {
      const fullPath = path.join(folderPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        return {
          name: file,
          type: "folder",
          path: path.join(currentPath, file),
        };
      }

      const ext = file.split(".").pop().toLowerCase();
      let type = "other";

      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) type = "image";
      if (["mp4", "mov", "webm", "avi"].includes(ext)) type = "video";

      return {
        name: file,
        url: `/${path.join(currentPath, file).replace(/\\/g, "/")}`,
        type,
        path: path.join(currentPath, file),
        extension: ext
      };
    });

    return new Response(JSON.stringify({ files }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Cannot read folder" }), { status: 500 });
  }
}