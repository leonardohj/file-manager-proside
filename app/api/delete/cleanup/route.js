import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const apagadosDir = path.join(process.cwd(), "public", "apagados");

    if (!fs.existsSync(apagadosDir)) return new Response(JSON.stringify({ success: true }));

    const files = fs.readdirSync(apagadosDir);

    for (const file of files) {
      if (!file.endsWith(".meta.json")) continue;

      const metaPath = path.join(apagadosDir, file);
      const data = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

      if (Date.now() >= data.deleteAt) {
        const originalFile = file.replace(".meta.json", "");
        const originalPath = path.join(apagadosDir, originalFile);

        if (fs.existsSync(originalPath)) {
          const stats = fs.lstatSync(originalPath);
          if (stats.isDirectory()) {
            fs.rmSync(originalPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(originalPath);
          }
        }

        fs.unlinkSync(metaPath);
      }
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("Erro ao limpar apagados:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}