"use client";
import {
  FolderOpenIcon,
  FolderIcon,
  DocumentIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  VideoCameraIcon
} from "@heroicons/react/24/solid";
import { useEffect, useState, useCallback } from "react";
import ContextMenu from "./ContextMenu";

export default function Files({
  path,
  refreshCounter,
  viewMode,
  setPath,
  filter,
  setSelected,
  selected,
  contextMenu,
  setContextMenu
}) {
  const [files, setFiles] = useState([]);

  const fetchFiles = useCallback(async () => {
    if (!path) return;
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Erro a buscar ficheiros:", err);
    }
  }, [path]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshCounter]);

  function handleChangeSelected(fileUrl, isShift) {
    if (!isShift)
    {
        setSelected([fileUrl]);
    }
    else
    {
    setSelected(prev => {
        if (prev.includes(fileUrl)) {
          // se já estiver no array, remove
          return prev.filter(item => item !== fileUrl);
        }
        // se não estiver, adiciona
        return [...prev, fileUrl];
      });
    }
  }
  return (
    <div
      className={
        viewMode === "list"
          ? "h-full"
          : "p-6 grid grid-cols-[repeat(auto-fill,177px)] gap-5 justify-center content-start h-full"
      }
    >
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
                selected.some(item => item === file.url)
                ? "border-proximo-600 bg-proximo-50 ring-2 ring-proximo-200"
                : "border-gray-200 bg-white hover:border-proximo-300 hover:shadow-md"
            }`}
            title={file.name}
            onDoubleClick={() => {
              if (file.type === "folder") setPath(file.path);
            }
        }
        onClick={(e) => handleChangeSelected(file.url, e.shiftKey)}
        onContextMenu={(e) => {
            e.preventDefault(); // impede menu default do browser
            setContextMenu({
              visible: true,
              x: e.clientX,
              y: e.clientY,
              file: file
            });
          }}
          >
            {file.type === "folder" ? (
              <div className="flex items-center flex-col">
                <FolderIcon className="h-14 w-14 text-proximo-600 group-hover:scale-110 transition-transform" />
                <p className="w-full text-[11px] mt-2 font-medium text-gray-600 group-hover:text-proximo-700 truncate px-2 text-center">
                  {file.name}
                </p>
                <span className="text-[10px] text-gray-400 mt-1">Pasta</span>
              </div>
            ) : (
              <div className="flex flex-col items-center h-full w-full justify-center">
                <div className="w-full min-h-28 max-h-28 flex items-center select-none justify-center bg-gray-50 rounded-lg p-1 overflow-hidden relative">
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
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div>
          <table className="w-full border-b rounded-b-xl border-gray-300 text-left border-separate border-spacing-0 table-fixed min-w-[500px] md:min-w-full">
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
                <th className="w-30 md:w-38 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 text-right border-b border-gray-200">
                  Opções
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 overflow-y-auto">
              {files.map((file, idx) => (
                <tr
                key={idx}
                className={`selectable-item group ${
                    selected.some(item => item === file.url) ? "bg-proximo-100" : "hover:bg-proximo-50"
                  }`}
                  onDoubleClick={() => {
                    if (file.type === "folder") setPath(file.path);
                  }}
                  onClick={() => handleChangeSelected(file.url)}
                >
                  <td className="px-4 py-2 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-3">
                        {file.type === "folder" && (<FolderIcon className="w-4 h-4 text-proximo-600 shrink-0 opacity-90"/>)}
                        {file.type === "image" && (<PhotoIcon className="w-4 h-4 text--500 shrink-0 opacity-90"/>)}
                        {file.type === "video" && (<VideoCameraIcon className="w-4 h-4 text-mauve-400 shrink-0 opacity-90"/>)}
                        {file.type === "other" && (<DocumentIcon className="w-4 h-4 text-gray-400 shrink-0 opacity-90"/>)}
                      <span
                        className="text-[13px] font-medium text-gray-700 group-hover:text-proximo-900 truncate max-w-full"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-[12px] text-gray-500 tabular-nums">
                    {file.sizeFormatted}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-2 text-center">
                    <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {file.extension}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-[12px] text-gray-400 tabular-nums">
                    {file.modified}
                  </td>
                  <td className="text-gray-500 flex justify-end items-center py-2 px-4 gap-2">
                    <button
                      type="button"
                      className="hidden cursor-pointer group-hover:flex items-center justify-center w-7 h-7 hover:text-proximo-600 hover:bg-proximo-200 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 text-proximo-600"></PencilIcon>
                    </button>

                    <div className="flex items-center justify-center w-7 h-7 hover:text-proximo-600 hover:bg-proximo-200 rounded-full transition-colors active:bg-proximo-200 duration-100 transition-colors">
                      <EllipsisVerticalIcon className="h-5.5 w-5.5 cursor-pointer"></EllipsisVerticalIcon>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        {
        contextMenu.visible && (
            <ContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu}></ContextMenu>
        )
    }   
    </div>
  );
}
