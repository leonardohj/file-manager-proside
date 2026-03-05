"use client";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useFileManagerContext } from "./FileManagerContext";

export default function ShowFile({ file }) {
  const { openShowFile, setOpenShowFile } = useFileManagerContext();

  if (!openShowFile || !file) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-4">
      <button
        type="button"
        onClick={() => setOpenShowFile(false)}
        className="fixed top-5 right-5 text-white/50 hover:text-white z-[1100] p-2"
      >
        <XMarkIcon className="w-10 h-10" />
      </button>

      <div className="relative w-full h-full max-w-[95vw] max-h-[90vh] flex items-center justify-center overflow-hidden">
        {file.type === "video" ? (
          <video
            src={file.url}
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            controls
            autoPlay
          />
        ) : (
          <img
            src={file.url}
            className="max-w-full max-h-full rounded shadow-2xl object-contain"
          />
        )}
      </div>
    </div>
  );
}
