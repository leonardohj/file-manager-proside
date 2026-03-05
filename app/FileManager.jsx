"use client";
import SearchComponent from "./SearchComponent";
import BreadCrumbs from "./BreadCrumbs";
import { useState, useEffect } from "react";
import Filters from "./Filters";
import Files from "./Files";
import AddFile from "./AddFile";
import NavItem from "./NavItem";
import {
  Bars3Icon,
  ArrowsPointingInIcon,
  HomeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useFileManagerContext } from "./FileManagerContext";
import TokenListener from "./TokenListener";
import Modal from "./Modal";

export default function FileManager() {
  // exemplo para viewOptions
  const {
    path,
    setPath,
    openFolders,
    refreshCounter,
    tree,
    setTree,
    showModal,
    setShowModal,
    modalConfig,
    setContextMenu,
    selected,
    contextMenu,
    dragOverItem,
    draggingItem,
    setDragOverItem,
    handleDragOver,
    handleDragStart,
    handleDrop,
    handleFileChange,
    setShowTree,
    showTree

  } = useFileManagerContext();

  const fetchTree = async () => {
    try {
      const openParam = openFolders.join(",");
      const res = await fetch(`/api/files/tree?openFolders=${openParam}`);
      const data = await res.json();
      setTree(data);
    } catch (err) {
      console.error("Erro a buscar árvore de pastas:", err);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [openFolders, refreshCounter]);


  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <TokenListener></TokenListener>
      <div className="bg-proximo-800 select-none p-2 flex justify-between items-center text-white z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-proximo-700 rounded transition-colors focus:outline-none">
            <Bars3Icon className="w-6 h-6" onClick={() => setShowTree(prev)} />
          </button>
          <img src="/logo.png" className="h-7" alt="Proximo" />
        </div>
        <SearchComponent />
      </div>

      <div className="flex h-full overflow-hidden">
        <div
          className={`select-none transition-all duration-300 ease-in-out border-r-2 border-proximo-800 flex flex-col bg-white overflow-hidden ${
            showTree ? "w-72" : "w-0"
          }`}
        >
          <div className="bg-proximo-700 font-semibold text-white px-4 h-9 flex justify-between items-center whitespace-nowrap">
            <span>Diretórios</span>
            <button className="p-1 hover:bg-proximo-600 rounded transition-colors group">
              <ArrowsPointingInIcon className="w-4 h-4 text-white/80 group-hover:text-white" />
            </button>
          </div>

          <div className="p-2 flex-1">
            <div className="w-[264px]">
              <div
                onClick={() => setPath("conteudos")}
                className={`flex items-center gap-2 px-2 py-1.5 mb-1 cursor-pointer rounded-md
                  ${path === "conteudos" ? "bg-gray-100 text-proximo-700" : "hover:bg-gray-100 text-gray-700"} 
                  ${dragOverItem === "conteudos" ? "bg-proximo-50 outline outline-2 outline-proximo-300" : ""}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    file: {
                      path: "conteudos",
                      type: "tree-father",
                      name: "conteudos",
                    },
                    selectedFiles: [
                      {
                        path: "conteudos",
                        type: "tree-father",
                        name: "conteudos",
                      },
                    ],
                  });
                }}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, {
                    path: "conteudos",
                    type: "tree-father",
                    name: "conteudos",
                  })
                }
                onDragEnter={() => {
                  if (draggingItem !== "conteudos")
                    setDragOverItem("conteudos");
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverItem(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverItem(null);
                  handleDrop(e, "conteudos");
                }}
                onDragOver={(e) => handleDragOver(e)}
              >
                
                <HomeIcon className="h-4 w-4 shrink-0 text-proximo-600" />
                <span className="text-sm truncate min-w-0 flex-1">
                  conteudos
                </span>
              </div>

              <ul className="ml-4">
                {tree.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </ul>
              <hr className="border-gray-200 border-[1px] my-2 rounded-2xl" />
              <div
                onClick={() => setPath("apagados")}
                className={`flex items-center  gap-2 px-2 py-1.5 mb-1 cursor-pointer rounded-md transition-all ${
                  path === "apagados"
                    ? "bg-gray-100 text-red-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <TrashIcon className="h-4 w-4 shrink-0 text-red-600" />
                <span className="text-sm truncate min-w-0 flex-1">
                  apagados
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between select-none bg-proximo-700 text-white min-h-[36px] max-h-[36px] items-center px-4 shadow-inner">
            <BreadCrumbs />
            <Filters />
          </div>
          <div
  className="overflow-y-auto h-full w-full relative"
  onDragOver={(e) => {
    e.preventDefault();
    // Optional: highlight background while dragging external files
    e.currentTarget.classList.add("bg-proximo-100/50");
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove("bg-proximo-100/50");
  }}
  onDrop={async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-proximo-100/50");

    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    // Reuse handleFileChange for each external file
    for (const file of files) {
      // create a synthetic event to match handleFileChange signature
      await handleFileChange({ target: { files: [file] } });
    }
  }}
>
  <Files />
</div>
        </div>

        <AddFile />
      </div>
      {showModal && (
        <Modal
          type={modalConfig.type}
          action={modalConfig.action}
          title={modalConfig.title}
          body={modalConfig.body}
          functionToUse={modalConfig.functionToUse}
          text={modalConfig.text}
        />
      )}
    </div>
  );
}
