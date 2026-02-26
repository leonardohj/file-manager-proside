"use client";
import { useState, useRef } from "react";
import { Plus, FolderPlus, ArrowUp } from "lucide-react";

export default function AddFile({ path, setRefreshCounter}) {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef(null);
  const refresh = () => setRefreshCounter(prev => prev + 1);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("currentPath", path); // <- envia a pasta atual

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload falhou");

      setProgress(100);
      setTimeout(() => setProgress(0), 500);

      setOpen(false);
      refresh?.(); // atualiza automaticamente após upload
    } catch (err) {
      console.error("Erro ao enviar ficheiro:", err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: newFolderName.trim(), currentPath: path }),
      });
      if (!res.ok) throw new Error("Falha ao criar pasta");

      setNewFolderName("");
      setShowModal(false);
      refresh?.(); // atualiza automaticamente após criar pasta
    } catch (err) {
      console.error(err);
    }
  };

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
              className="flex items-center justify-center w-12 h-12 bg-white text-proximo-700 rounded-full shadow-xl border border-gray-200 cursor-pointer hover:bg-gray-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <ArrowUp className="w-6 h-6" />
              <input type="file" onChange={handleFileChange} />
            </label>

            <button
              onClick={() => {
                setShowModal(true);
                setOpen(false);
              }}
              className="flex items-center justify-center w-12 h-12 bg-white text-proximo-700 rounded-full shadow-xl border border-gray-200 hover:bg-gray-100"
            >
              <FolderPlus className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {progress > 0 && (
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-proximo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nova Pasta</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-proximo-500 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600">
                Cancelar
              </button>
              <button onClick={handleCreateFolder} className="px-5 py-2.5 bg-proximo-700 text-white rounded-xl">
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}