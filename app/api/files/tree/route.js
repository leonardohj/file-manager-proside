import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function buildTree(basePath, relativePath = "conteudos", openFolders = []) {
  const fullPath = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) return [];

  const directories = fs.readdirSync(fullPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  return directories.map((dirent) => {
    const name = dirent.name;
    const currentRelative = path.join(relativePath, name);

    const childFullPath = path.join(process.cwd(), "public", currentRelative);

    const subDirs = fs.existsSync(childFullPath)
      ? fs.readdirSync(childFullPath, { withFileTypes: true }).filter(d => d.isDirectory())
      : [];

    const hasChildren = subDirs.length > 0;

    return {
      name,
      path: currentRelative,
      has_children: hasChildren,
      children: openFolders.includes(currentRelative)
        ? buildTree(basePath, currentRelative, openFolders)
        : [],
    };
  });
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const openFoldersParam = url.searchParams.get("openFolders") || "";
    const openFolders = openFoldersParam ? openFoldersParam.split(",") : [];

    const tree = buildTree(null, "conteudos", openFolders);

    return new Response(JSON.stringify(tree), { status: 200 });
  } catch (err) {
    console.error("Erro a construir a árvore:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}