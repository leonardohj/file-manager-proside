"use client";
import { createContext, useContext, useState, useEffect } from "react";

const FileManagerContext = createContext();

export function FileManagerProvider({ children }) {
  // ===========================
  // States
  // ===========================
  const [path, setPath] = useState("conteudos");
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    file: null,
    selectedFiles: null,
  });
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [tree, setTree] = useState([]);
  const [openFolders, setOpenFolders] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [openShowFile, setOpenShowFile] = useState(false);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [showTree, setShowTree] = useState(true);

  const refresh = () => setRefreshCounter((prev) => prev + 1);

  // ===========================
  // Folder Utilities
  // ===========================
  const toggleFolder = (folderPath) => {
    setOpenFolders((prev) =>
      prev.includes(folderPath)
        ? prev.filter((p) => p !== folderPath)
        : [...prev, folderPath]
    );
  };

  const handleCreateFolder = async (folderName, setFolderName) => {
    if (path === "apagados") return;
    if (!folderName.trim()) return;

    try {
        
      const cleanName = folderName.trim();
      const parentPath = contextMenu.file?.path || path;
      console.log(cleanName + ", " + path)

      await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderName: cleanName,
          currentPath: parentPath,
        }),
      });

      const newFolderPath = `${parentPath}/${cleanName}`;
      setFolderName("");
      setShowModal(false);
      refresh();

      setOpenFolders((prev) => {
        const updated = new Set(prev);
        updated.add(parentPath);
        updated.add(newFolderPath);
        return Array.from(updated);
      });
    } catch (err) {
      console.error("Erro ao criar pasta:", err);
    }
  };

  const handleRename = async (newName, setNewName, file) => {
    if (path === "apagados" || !file || !newName.trim()) return;

    try {
      const cleanName = newName.trim();
      const res = await fetch("/api/rename", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath: file.path, newName: cleanName }),
      });

      if (!res.ok) throw new Error("Falha ao renomear");
      setNewName("");
      setShowModal(false);
      refresh();
    } catch (err) {
      console.error("Erro ao renomear:", err);
    }
  };

  const handleMoveToApagados = async (filePaths) => {
    if (!filePaths || filePaths.length === 0) return;

    const filesArray = Array.isArray(filePaths) ? filePaths : [filePaths];

    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      file: null,
      selectedFiles: null,
    });

    try {
      const res = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePaths: filesArray }), // send array
      });

      if (!res.ok) throw new Error("Falha ao mover ficheiros");
      refresh();

      // If current path is one of the deleted files, move up
      if (filesArray.includes(path)) {
        const parent = path.split("/").slice(0, -1).join("/");
        setPath(parent);
      }
    } catch (err) {
      console.error("Erro ao mover ficheiros:", err);
    }
  };

  // ===========================
  // File Upload
  // ===========================
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("currentPath", path);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload falhou");

      setProgress(100);
      setTimeout(() => setProgress(0), 500);
      setOpen(false);
      refresh();
    } catch (err) {
      console.error("Erro ao enviar ficheiro:", err);
    }
  };

  // ===========================
  // Drag & Drop
  // ===========================
  const handleDragStart = (e, file) => {
    const draggedItems = selected.some((f) => f.path === file.path)
      ? selected
      : [file];
    e.dataTransfer.setData("application/json", JSON.stringify(draggedItems));
    e.dataTransfer.effectAllowed = "move";

    const dragPreview = document.createElement("div");
    dragPreview.className =
      "py-2 px-4 bg-proximo-600 text-white rounded shadow-lg font-medium text-xs z-[-1] whitespace-nowrap pointer-events-none";
    dragPreview.innerText =
      draggedItems.length > 1 ? `${draggedItems.length} items` : file.name;
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-9999px";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(
      dragPreview,
      dragPreview.offsetWidth / 2,
      dragPreview.offsetHeight / 2
    );
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const handleDrop = async (e, targetFolder) => {
    e.preventDefault();
    setDragOverItem(null);
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const itemsToMove = JSON.parse(data); // array of { path, name, type }
    if (itemsToMove.some((f) => f.path === targetFolder)) return;

    try {
      await fetch("/api/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: itemsToMove.map((f) => f.path),
          to: targetFolder,
        }),
      });
      refresh();
    } catch (err) {
      console.error("Erro ao mover ficheiro(s):", err);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // ===========================
  // Modals
  // ===========================
  const openModal = (action, type = null, text = null) => {
    const modalType = type || contextMenu.file?.type;

    setModalConfig({
      action,
      type: modalType,
      file: contextMenu.file,
      selectedFiles: contextMenu.selectedFiles || selected, // pass the multi-selection
      title: null,
      body: null,
      text,
      functionToUse:
        action === "add"
          ? handleCreateFolder
          : action === "rename"
          ? handleRename
          : action === "delete"
          ? () => {
              // if there are selected files, delete all; otherwise just the single file
              const filesToDelete =
                contextMenu.selectedFiles?.length > 0
                  ? contextMenu.selectedFiles.map((f) => f.path)
                  : [contextMenu.file.path];
              handleMoveToApagados(filesToDelete);
            }
          : () => {},
    });

    if (open) setOpen(false);
    setShowModal(true);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // ===========================
  // sendSelectedFile
  // ===========================
  const sendSelectedFile = (files) => {
    if (!files) return;
    const filesArray = Array.isArray(files) ? files : [files];

    const payload =
      filesArray.length === 1
        ? { type: "SELECTED_FILE", path: filesArray[0].path, currentPath: path }
        : {
            type: "SELECTED_FILE",
            path: filesArray.map((f) => f.path),
            currentPath: path,
          };

    console.log("Sending payload:", payload);
    window.parent.postMessage(payload, "*");
  };

  // ===========================
  // Cleanup apagados
  // ===========================
  useEffect(() => {
    if (path !== "apagados") return;

    const cleanup = async () => {
      try {
        await fetch("/api/delete/cleanup");
      } catch (err) {
        console.error("Erro ao limpar apagados:", err);
      }
      refresh();
    };

    cleanup();
    const interval = setInterval(cleanup, 60000);
    return () => clearInterval(interval);
  }, [path]);

  return (
    <FileManagerContext.Provider
      value={{
        path,
        setPath,
        selected,
        setSelected,
        contextMenu,
        setContextMenu,
        filter,
        setFilter,
        viewMode,
        setViewMode,
        tree,
        setTree,
        openFolders,
        setOpenFolders,
        refreshCounter,
        setRefreshCounter,
        showModal,
        setShowModal,
        modalConfig,
        setModalConfig,
        progress,
        setProgress,
        open,
        setOpen,
        openShowFile,
        setOpenShowFile,
        toggleFolder,
        handleCreateFolder,
        handleRename,
        handleMoveToApagados,
        handleFileChange,
        handleDragStart,
        handleDragOver,
        handleDrop,
        dragOverItem,
        setDragOverItem,
        refresh,
        openModal,
        sendSelectedFile,
        showTree,
        setShowTree
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}
