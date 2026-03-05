import { useEffect, useRef, useState } from "react";
import {
  FolderIcon,
  EyeIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/solid";
import { useFileManagerContext } from "./FileManagerContext";
import ShowFile from "./ShowFile";
import Modal from "./Modal";

export default function ContextMenu() {
  const {
    contextMenu,
    setContextMenu,
    setOpenShowFile,
    openShowFile,
    showModal,
    setShowModal,
    handleCreateFolder,
    handleRename,
    modalConfig,
    setModalConfig,
    openModal,
    handleMoveToApagados,
    sendSelectedFile
  } = useFileManagerContext();

  const menuRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    }

    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  const calculateX = () => {
    const menuWidth = 208;
    return contextMenu.x + menuWidth > window.innerWidth
      ? contextMenu.x - menuWidth
      : contextMenu.x;
  };

  const calculateY = () => {
    const menuHeight = 220;
    return contextMenu.y + menuHeight > window.innerHeight
      ? contextMenu.y - menuHeight
      : contextMenu.y;
  };

  return (
    <>
      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="fixed z-[999] w-52 bg-white border border-gray-200 shadow-2xl rounded-xl py-1 text-sm text-gray-700"
          style={{ top: calculateY(), left: calculateX() }}
        >
          <div className="px-4 py-2 border-b mb-1 border-gray-100 font-bold text-proximo-700 truncate text-xs">
            {contextMenu.selectedFiles?.length > 1
              ? `${contextMenu.selectedFiles.length} itens selecionados`
              : contextMenu.file.name}
          </div>

          {contextMenu.file.type !== "folder" &&
            contextMenu.selectedFiles?.every((f) =>
              ["image", "video", "other"].includes(f.type)
            ) && (
              <>
                <button
                  onClick={() => sendSelectedFile(contextMenu.selectedFiles)}
                  className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors"
                >
                  <CursorArrowRaysIcon className="w-4 h-4 text-proximo-600" />
                  <span>Escolher</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
              </>
            )}
          {(contextMenu.selectedFiles?.length <= 1 || contextMenu.selectedFiles === null) && (
            <>
            {console.log(contextMenu.selectedFiles)}
              {(contextMenu.file.type === "folder" ||
                contextMenu.file.type === "tree-father") && (
                <button
                  onClick={() => openModal("add")}
                  className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors"
                >
                  <FolderIcon className="w-4 h-4 text-proximo-600" />
                  <span>Criar Subdiretoria</span>
                </button>
              )}

              {(contextMenu.file.type === "image" ||
                contextMenu.file.type === "video") && (
                <button
                  onClick={() => setOpenShowFile(true)}
                  className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 text-proximo-600" />
                  <span>
                    {contextMenu.file.type === "video"
                      ? "Visualizar vídeo"
                      : "Visualizar imagem"}
                  </span>
                </button>
              )}

              {contextMenu.file.type !== "tree-father" && (
                <button
                  onClick={() =>
                    openModal(
                      "rename",
                      contextMenu.file.type,
                      contextMenu.file.name.replace(
                        new RegExp(`\\.${contextMenu.file.extension}$`, "i"),
                        ""
                      )
                    )
                  }
                  className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4 text-proximo-600" />
                  <span>Renomear</span>
                </button>
              )}
            </>
          )}
          {(contextMenu.file.type === "image" ||
            contextMenu.file.type === "video" ||
            contextMenu.file.type === "other") && (
            <>
              {(contextMenu.selectedFiles?.length > 0 &&
                contextMenu.selectedFiles?.every((f) =>
                  ["image", "video", "other"].includes(f.type)
                )) && (
                  <a
                    href={
                      contextMenu.selectedFiles.length === 1
                        ? contextMenu.selectedFiles[0].url
                        : "#"
                    }
                    download
                    onClick={(e) => {
                      // If multiple files, you can trigger download logic here
                      if (contextMenu.selectedFiles?.length > 1) {
                        e.preventDefault();
                        contextMenu.selectedFiles.forEach((file) => {
                          const link = document.createElement("a");
                          link.href = file.url;
                          link.download = file.name;
                          link.click();
                        });
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-proximo-50 flex items-center gap-2 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 text-proximo-600" />
                    <span>Descarregar</span>
                  </a>
                )}
            </>
          )}
          {contextMenu.file.type !== "tree-father" && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => openModal("delete", contextMenu.selectedFiles)}
                className="w-full text-left px-4 py-2.5 mb-1 text-red-600 hover:bg-proximo-50 flex items-center gap-2 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </>
          )}

          <ShowFile file={contextMenu.file} />
        </div>
      )}

      {/* Modal renderizado com os parâmetros do modalConfig */}
    </>
  );
}
