import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function PUT(req) {
  try {
    const { oldPath, newName } = await req.json();

    if (!oldPath || !newName) {
      return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
    }

    const basePath = path.join(process.cwd(), "public");

    const oldFullPath = path.join(basePath, oldPath);
    const ext = path.extname(oldFullPath);

    const dir = path.dirname(oldFullPath);
    const newFullPath = path.join(dir, newName + ext);

    if (!oldFullPath.startsWith(basePath) || !newFullPath.startsWith(basePath)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), { status: 400 });
    }

    if (!fs.existsSync(oldFullPath)) {
      return new Response(JSON.stringify({ error: "File not found" }), { status: 404 });
    }

    fs.renameSync(oldFullPath, newFullPath);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Rename failed" }), { status: 500 });
  }
}