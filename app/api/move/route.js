import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { from, to } = await req.json(); // JOHNSON recebido

    if (!from || !to) 
      return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });

    const baseDir = path.resolve("public"); 
    const toPathBase = path.join(baseDir, to);

    // Cria pasta destino se não existir
    fs.mkdirSync(toPathBase, { recursive: true });

    // Garante que from seja array
    const fromArray = Array.isArray(from) ? from : [from];

    const results = [];

    for (const item of fromArray) {
      const fromPath = path.join(baseDir, item);
      const toPath = path.join(toPathBase, path.basename(item));

      if (!fs.existsSync(fromPath)) {
        results.push({ from: item, success: false, message: "Arquivo ou pasta não existe" });
        continue;
      }

      if (fs.existsSync(toPath)) {
        results.push({ from: item, success: false, message: "Destino já existe" });
        continue;
      }

      try {
        fs.renameSync(fromPath, toPath);
        results.push({ from: item, success: true, movedTo: toPath });
      } catch (err) {
        results.push({ from: item, success: false, message: "Erro ao mover", error: err.message });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Erro ao mover arquivos:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}