import {
  FolderIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilSquareIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon
} from "@heroicons/react/24/solid";
import { useFileManagerContext } from "./FileManagerContext";
import { useState } from "react";
export default function Modal({
  type = null,
  action = null,
  title = null,
  body = null,
  functionToUse,
  text = ""
}) {
  const [textInput, setTextInput] = useState(text);
  const {showModal, setShowModal, contextMenu} = useFileManagerContext();
  let headerTitle = "";
    if (title !== null) {
        headerTitle = title;
      } else if (type === "folder" || (type === "tree-father" && action === "add")) {
        headerTitle = "Nova Pasta";
      } else if (type === "error") {
        headerTitle = "Erro";
      } else if (action === "rename") {
        headerTitle = "Renomear";
      } else if (action === "delete") {
        headerTitle = "Apagar " + contextMenu.file.name;
      }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        
      <div
        onClick={() => setShowModal(false)}
        className="absolute inset-0 bg-black/50"
      ></div>

      <div className="relative bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-9 flex items-center justify-center text-proximo-500">
            {(type === "folder" || type === "tree-father") && <FolderIcon className="h-7" />}
            {type === "error" && (
              <ExclamationTriangleIcon className="w-7.5 text-amber-300" />
            )}
            {type === "image" && (
              <PhotoIcon className="w-7.5 text-proximo-5000" />
            )}
            {type === "video" && (
              <VideoCameraIcon className="w-7.5 text-proximo-500" />
            )}
            {type === "other" && (
              <DocumentIcon className="w-7.5 text-proximo-500" />
            )}
            {action === "add" && (
              <PlusIcon className="absolute bottom-[-8px] right-0 h-5 w-5 rounded-full bg-white" />
            )}
            {action === "delete" && (
              <TrashIcon className="absolute bottom-[-8px] right-0 h-5 w-5 p-0.5 rounded-full bg-white" />
            )}
            {action === "rename" && (
              <PencilSquareIcon className="absolute bottom-[-8px] right-0 h-5 w-5 p-0.5 rounded-full bg-white" />
            )}
          </div>
          <h2 className="font-bold text-lg">
            {headerTitle}
          </h2>
        </div>
        {action === "add" || action === "rename" ? (
          <input
          type="text"
          placeholder="Escreve o nome..."
          value={textInput ? textInput : ""}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              functionToUse(textInput, setTextInput, contextMenu.file);
              setShowModal(false);
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-proximo-500"
        />
        ) : (
          <div className="py-2 px-4 mb-4">
            {type === "error" && body === null
              ? "Um erro aconteceu, tente mais tarde..."
              : "Tem a certeza que quer apagar " + contextMenu.file.name + "? Este ficheiro estará na pasta de apagados durante 30 dias."} 
          </div>
        )}

        <div className="flex justify-end gap-2">
          {(action === "add" || action === "delete" || action === "rename") && (
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-1.5 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => {
              functionToUse(textInput, setTextInput, contextMenu.file);
              
              setShowModal(false);
            }}
            className="px-4 py-1.5 bg-proximo-600 text-white rounded-lg"
          >
            {type === "error" || action === "delete" ? "Continuar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}