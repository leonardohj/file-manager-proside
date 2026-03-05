"use client";
import { useState, useRef } from "react";
import { Plus, FolderPlus, ArrowUp } from "lucide-react";
import { useFileManagerContext } from "./FileManagerContext";
import Modal from "./Modal";

export default function AddFile() {
  const {
    path,
    setRefreshCounter,
    toggleFolder,
    refres,
    configModal,
    setConfigModal,
    openModal,
    handleFileChange,
    progress,
    setProgress,
    open,
    setOpen,
    setContextMenu,
    defaultContextMenu
  } = useFileManagerContext();
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef(null);

  return (
    <div className="fixed bottom-10 right-10 flex flex-col items-center gap-4 z-[100]">
      <div className="flex flex-col-reverse items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-center w-14 h-14 text-white rounded-full shadow-2xl transition-all duration-300 z-10 ${
            open ? "rotate-45 bg-red-500" : "bg-proximo-700"
          }`}
        >
          <Plus className="w-8 h-8" />
        </button>

        {open && (
  <>
    <label
      className={`flex items-center justify-center w-12 h-12 bg-white text-proximo-700 rounded-full shadow-xl border border-gray-200 
      ${path === "apagados" ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"}`}
    >
      <ArrowUp className="w-6 h-6" />

      {path !== "apagados" && (
        <input
          type="file"
          onChange={(e) => {
            
            handleFileChange(e);
          }}
          className="hidden"
        />
      )}
    </label>

    <button
      onClick={() => {
        if (path === "apagados") return;
        openModal("add", "folder");
      }}
      disabled={path === "apagados"}
      className="flex items-center justify-center w-12 h-12 bg-white text-proximo-700 rounded-full shadow-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FolderPlus className="w-6 h-6" />
    </button>
  </>
)}
      </div>

      {progress > 0 && (
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-proximo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
