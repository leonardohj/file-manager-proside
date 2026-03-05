"use client";
import { FolderIcon, ChevronRightIcon, FolderOpenIcon } from "@heroicons/react/24/solid";
import { useFileManagerContext } from "./FileManagerContext";

export default function NavItem({ item }) {
  const {
    path,
    openFolders,
    setPath,
    toggleFolder,
    setSelected,
    contextMenu,
    setContextMenu,
    selected,
    handleDragStart,
    handleDrop,
    handleDragOver,
    dragOverItem,
    setDragOverItem,
    draggingItem,
  } = useFileManagerContext();

  const isActive = String(item.path) === String(path);
  const isOpen = openFolders.includes(item.path);

  const handleClick = () => {
    setSelected([]);
    setPath(item.path);
    if (item.has_children || (item.children && item.children.length > 0)) {
      toggleFolder(item.path);
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation(); // ⚡ Prevent parent click
    toggleFolder(item.path);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const isSelected = selected.some(f => f.path === item.path);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      file: item,
      selectedFiles: isSelected ? selected : [item],
    });
  };

  return (
    <li className="flex flex-col">
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition-colors
          ${isActive ? "bg-gray-100 text-proximo-700" : "text-gray-700 hover:bg-gray-100"} 
          ${dragOverItem === item.path ? "border-proximo-600 bg-proximo-50 ring-2 ring-proximo-200" : ""}
        `}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnter={() => {
          if (item.type === "folder" && draggingItem !== item.path) setDragOverItem(item.path);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragOverItem(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverItem(null);
          if (item.type === "folder") handleDrop(e, item.path);
        }}
        onDragOver={(e) => {
          if (item.type === "folder") handleDragOver(e);
        }}
      >
        {isActive ? (
          <FolderOpenIcon className="h-4 w-4 shrink-0 text-proximo-700" />
        ) : (
          <FolderIcon className="h-4 w-4 shrink-0 text-proximo-600" />
        )}

        <span className="text-sm truncate min-w-0 flex-1">{item.name}</span>

        {(item.children?.length > 0 || item.has_children) && (
          <button onClick={handleToggleClick} className="p-1">
            <ChevronRightIcon
              className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""} opacity-40`}
            />
          </button>
        )}
      </div>

      {isOpen && item.children?.length > 0 && (
        <ul className="ml-4 border-l border-gray-200 mt-0.5">
          {item.children.map((child) => (
            <NavItem key={child.path} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}