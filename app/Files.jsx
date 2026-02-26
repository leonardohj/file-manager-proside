"use client";
import { FolderOpenIcon, FolderIcon, DocumentIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useCallback } from "react";

export default function Files({ path, refreshCounter, viewMode, setPath }) {
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
      ) : (
        files.map((file, idx) => (
          <div
            key={idx}
            className={`selectable-item cursor-pointer w-40 h-40 p-4 border rounded-xl transition-all flex flex-col items-center justify-center text-center group ${
              path === file.url
                ? "border-proximo-600 bg-proximo-50 ring-2 ring-proximo-200"
                : "border-gray-200 bg-white hover:border-proximo-300 hover:shadow-md"
            }`}
            title={file.name}
            onDoubleClick={() => {
              if (file.type === "folder") setPath(file.path);
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
              <div className="flex flex-col items-center h-full w-full justify-center ">
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
      )}
    </div>
  );
}
