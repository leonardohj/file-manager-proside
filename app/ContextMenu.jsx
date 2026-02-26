import { useEffect, useRef } from "react";
import { FolderIcon, EyeIcon, PencilSquareIcon, ArrowDownTrayIcon, TrashIcon} from "@heroicons/react/24/solid";

export default function ContextMenu({contextMenu, setContextMenu}) {
  const menuRef = useRef(null);

  // fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    }

    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);
  return (
<div
    ref={menuRef}
    className="fixed z-[999] w-52 bg-white border border-gray-200 shadow-2xl rounded-xl py-1 text-sm text-gray-700"
    style={{ top: contextMenu.y, left: contextMenu.x }}
  >
      <div className="px-4 py-2 border-b border-gray-100 font-bold text-proximo-700 truncate text-xs">{contextMenu.file.name}</div>

        <button className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors">
            <FolderIcon class="w-4 h-4 text-proximo-600"/>
            <span>Criar Subdiretoria</span>
        </button>
        <button className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors">
            <EyeIcon class="w-4 h-4 text-proximo-600"/>
            <span>{contextMenu.file.type === "video" ? 'Visualizar vídeo' : 'Visualizar imagem'}</span>
        </button>
        <button className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors">
            <PencilSquareIcon class="w-4 h-4 text-proximo-600"/>
            <span>Renomear</span>
        </button>
        <div class="border-t border-gray-100 my-1"></div>
        <a href={contextMenu.file.url} download className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors">
            <ArrowDownTrayIcon class="w-4 h-4 text-proximo-600"/>
            <span>Descarregar</span>
        </a>
        <button className="w-full text-left px-4 py-2.5  text-red-600 hover:bg-proximo-50 flex items-center gap-2 transition-colors">
            <TrashIcon class="w-4 h-4"/>
            <span>Eliminar</span>
        </button>
    </div>
  );
}
