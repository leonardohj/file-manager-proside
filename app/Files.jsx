"use client";
import {
  FolderOpenIcon,
  FolderIcon,
  DocumentIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState, useCallback } from "react";
import ContextMenu from "./ContextMenu";
import { useFileManagerContext } from "./FileManagerContext";

export default function Files() {
  const {
    path,
    refreshCounter,
    viewMode,
    setPath,
    filter,
    setSelected,
    selected,
    contextMenu,
    setContextMenu,
    openModal,
    handleDragStart,
    handleDrop,
    handleDragOver,
    dragOverItem,
    setDragOverItem,
    draggingItem,
    sendSelectedFile,
  } = useFileManagerContext();

  const [files, setFiles] = useState([]);
  const [timeLeftMap, setTimeLeftMap] = useState({});

  const fetchFiles = useCallback(async () => {
    if (!path) return;
    try {
      const res = await fetch(
        `/api/files?path=${encodeURIComponent(path)}&filter=${encodeURIComponent(filter)}`
      );
      const data = await res.json();
      const filesList = data.files || [];
      setFiles(filesList);

      if (path === "apagados") {
        const map = {};
        await Promise.all(
          filesList.map(async (file) => {
            try {
              const metaPath = `${file.path}.meta.json`;
              const metaRes = await fetch(metaPath);
              if (!metaRes.ok) return;
              const meta = await metaRes.json();
              const diffMs = meta.deleteAt - Date.now();
              map[file.path] = diffMs > 0 ? diffMs : 0;
            } catch {}
          })
        );
        setTimeLeftMap(map);
      }
    } catch (err) {
      console.error("Erro a buscar ficheiros:", err);
    }
  }, [path, filter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshCounter, filter]);

  // Countdown for apagados
  useEffect(() => {
    if (path !== "apagados") return;
    const interval = setInterval(() => {
      setTimeLeftMap((prev) => {
        const newMap = {};
        Object.entries(prev).forEach(([key, val]) => {
          newMap[key] = val - 60000 > 0 ? val - 60000 : 0;
        });
        return newMap;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [path]);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "Expirado";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  };

  // Store **full file objects** in selected
  const handleChangeSelected = (file, isShift) => {
    if (!isShift) {
      setSelected([file]);
    } else {
      setSelected((prev) => {
        if (prev.find((f) => f.path === file.path)) {
          return prev.filter((f) => f.path !== file.path);
        }
        return [...prev, file];
      });
    }
  };

  return (
    <div
      className={
        viewMode === "list"
          ? "h-full"
          : "p-6 grid grid-cols-[repeat(auto-fill,177px)] gap-5 justify-center content-start h-full"
      }
      onContextMenu={(e) => {
        e.preventDefault();
        // Only show background menu if NOT clicking a file
        if (e.target.closest(".selectable-item")) return;
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          file: {
            name: "Opções",
            type: "background",
          },
          selectedFiles: [], // no selected files for background
        });
      }}>
      {files.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
          <FolderOpenIcon className="h-16 w-16 opacity-20 mb-4" />
          <p className="text-sm">Esta pasta está vazia</p>
        </div>
      ) : viewMode === "grid" ? (
        files.map((file, idx) => (
          <div
            key={idx}
            className={`selectable-item select-none cursor-pointer w-40 h-40 p-4 border rounded-xl transition-all flex flex-col items-center justify-center text-center group ${
              selected.find((f) => f.path === file.path) || dragOverItem === file.path
                ? "border-proximo-600 bg-proximo-50 ring-2 ring-proximo-200"
                : "border-gray-200 bg-white hover:border-proximo-300 hover:shadow-md"
            }`}
            title={file.name}
            onDoubleClick={() => {
              if (file.type === "folder") setPath(file.path);
              else sendSelectedFile(file);
            }}
            onClick={(e) => handleChangeSelected(file, e.shiftKey)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              let newSelected;
              if (!selected.find((f) => f.path === file.path)) {
                newSelected = [file];
                setSelected(newSelected);
              } else {
                newSelected = selected;
              }
              setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                file,
                selectedFiles: newSelected,
              });
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, file)}
            onDragEnter={() => {
              if (file.type === "folder" && draggingItem !== file.path) {
                setDragOverItem(file.path);
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDragOverItem(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverItem(null);
              if (file.type === "folder") handleDrop(e, file.path);
            }}
            onDragOver={(e) => {
              if (file.type === "folder") handleDragOver(e);
            }}
          >
            {file.type === "folder" ? (
              <div className="flex items-center flex-col">
                <FolderIcon className="h-14 w-14 text-proximo-600 group-hover:scale-110 transition-transform" />
                <p className="w-full text-[11px] mt-2 font-medium text-gray-600 group-hover:text-proximo-700 truncate px-2 text-center">
                  {file.name}
                </p>
                <span className="text-[10px] text-gray-400 mt-1">Pasta</span>
                {path === "apagados" &&
                  timeLeftMap[file.path] !== undefined && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {formatTime(timeLeftMap[file.path])}
                    </p>
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center h-full w-full justify-center">
                <div className="w-full min-h-24 max-h-24 flex items-center select-none justify-center bg-gray-50 rounded-lg p-1 overflow-hidden relative">
                  {file.type === "image" && (
                    <img
                      src={file.path}
                      className="max-h-full max-w-full select-none object-contain rounded"
                      draggable={false}
                    />
                  )}
                  {file.type === "video" && (
                    <video
                      src={file.path + "#t=0.5"}
                      className="max-h-full max-w-full object-cover rounded"
                      preload="metadata"
                      muted
                    />
                  )}
                  {file.type !== "image" && file.type !== "video" && (
                    <DocumentIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center w-full px-1 select-none">
                  <p className="text-[11px] truncate font-medium text-gray-600 group-hover:text-proximo-700">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase">
                    {file.extension || "file"}
                  </p>
                  {path === "apagados" &&
                    timeLeftMap[file.path] !== undefined && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {formatTime(timeLeftMap[file.path])}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div>
          <table className="w-full border-b rounded-b-xl border-gray-300 text-left table-fixed min-w-[500px] md:min-w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b border-gray-200">
                  Nome
                </th>
                <th className="w-24 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 text-center border-b border-gray-200">
                  Tamanho
                </th>
                <th className="hidden sm:table-cell w-28 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 text-center border-b border-gray-200">
                  Tipo
                </th>
                <th className="w-40 md:w-48 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 text-right border-b border-gray-200">
                  Modificado
                </th>
                {path === "apagados" && (
                  <th className="w-30 md:w-38 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 text-right border-b border-gray-200">
                    Tempo Restante
                  </th>
                )}
                <th className="w-30 md:w-38 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 text-right border-b border-gray-200">
                  Opções
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.map((file, idx) => (
                <tr
                  key={idx}
                  className={`selectable-item group ${
                    selected.find((f) => f.path === file.path) || dragOverItem === file.path
                      ? "bg-proximo-100"
                      : "hover:bg-proximo-50"
                  }`}
                  onDoubleClick={() => {
                    if (file.type === "folder") setPath(file.path);
                  }}
                  onClick={(e) => handleChangeSelected(file, e.shiftKey)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    let newSelected;
                    if (!selected.find((f) => f.path === file.path)) {
                      newSelected = [file];
                      setSelected(newSelected);
                    } else {
                      newSelected = selected;
                    }
                    setContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      file,
                      selectedFiles: newSelected,
                    });
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnter={() => {
                    if (file.type === "folder" && draggingItem !== file.path) {
                      setDragOverItem(file.path);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDragOverItem(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverItem(null);
                    if (file.type === "folder") handleDrop(e, file.path);
                  }}
                  onDragOver={(e) => {
                    if (file.type === "folder") handleDragOver(e);
                  }}
                >
                  <td className="px-4 py-2 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-3">
                      {file.type === "folder" && (
                        <FolderIcon className="w-4 h-4 text-proximo-600 shrink-0 opacity-90" />
                      )}
                      {file.type === "image" && (
                        <PhotoIcon className="w-4 h-4 text-gray-500 shrink-0 opacity-90" />
                      )}
                      {file.type === "video" && (
                        <VideoCameraIcon className="w-4 h-4 text-mauve-400 shrink-0 opacity-90" />
                      )}
                      {file.type !== "folder" &&
                        file.type !== "image" &&
                        file.type !== "video" && (
                          <DocumentIcon className="w-4 h-4 text-gray-400 shrink-0 opacity-90" />
                        )}
                      <span
                        className="text-[13px] font-medium text-gray-700 group-hover:text-proximo-900 truncate max-w-full"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-[12px] text-gray-500 tabular-nums">
                    {file.sizeFormatted || "-"}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-2 text-center">
                    <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {file.extension || (file.type === "folder" ? "pasta" : "file")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-[12px] text-gray-400 tabular-nums">
                    {file.modified || "-"}
                  </td>
                  {path === "apagados" &&
                    timeLeftMap[file.path] !== undefined && (
                      <td className="px-4 py-2 text-right text-[12px] text-red-500 tabular-nums">
                        {formatTime(timeLeftMap[file.path])}
                      </td>
                    )}
                  <td className="text-gray-500 flex justify-end items-center py-2 px-4 gap-2">
                    <button
                      type="button"
                      onClick={() => openModal("rename", file.type, file)}
                      className="hidden cursor-pointer group-hover:flex items-center justify-center w-7 h-7 hover:text-proximo-600 hover:bg-proximo-200 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 text-proximo-600" />
                    </button>
                    <div className="flex items-center justify-center w-7 h-7 hover:text-proximo-600 hover:bg-proximo-200 rounded-full transition-colors active:bg-proximo-200 duration-100">
                      <EllipsisVerticalIcon
                        onClick={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                            file,
                            selectedFiles: selected,
                          });
                        }}
                        className="h-5.5 w-5.5 cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {contextMenu.visible && (
        <ContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu} />
      )}
    </div>
  );
}