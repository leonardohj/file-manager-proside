import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function DELETE(req) {
  try {
    const { filePaths } = await req.json();

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum filePath fornecido" }), { status: 400 });
    }

    const apagadosDir = path.join(process.cwd(), "public", "apagados");
    if (!fs.existsSync(apagadosDir)) fs.mkdirSync(apagadosDir, { recursive: true });

    const getUniquePath = (dir, name) => {
      let newPath = path.join(dir, name);
      let counter = 1;

      while (fs.existsSync(newPath)) {
        const ext = path.extname(name);
        const base = path.basename(name, ext);
        newPath = path.join(dir, `${base} (${counter})${ext}`);
        counter++;
      }

      return newPath;
    };

    const expireDate = Date.now() + 60 * 1000; // 1 minute

    for (const filePath of filePaths) {
      const fullPath = path.join(process.cwd(), "public", filePath);
      if (!fs.existsSync(fullPath)) continue;

      const name = path.basename(fullPath);
      const newPath = getUniquePath(apagadosDir, name);

      fs.renameSync(fullPath, newPath);

      // meta always beside file/folder
      const metaPath = newPath + ".meta.json";
      fs.writeFileSync(metaPath, JSON.stringify({ deleteAt: expireDate }, null, 2));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Erro ao mover para apagados:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}