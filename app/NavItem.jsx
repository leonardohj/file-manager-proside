"use client";
import { FolderIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function NavItem({ item, activePath, openFolders, setPath, toggleFolder }) {
  const isActive = String(item.path) === String(activePath);
  const isOpen = openFolders.includes(item.path);

  const handleClick = () => {
    setPath(item.path); // muda o path
    if (item.has_children || (item.children && item.children.length > 0)) {
      toggleFolder(item.path); // alterna aberto/fechado
    }
  };

  return (
    <li className="flex flex-col">
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition-colors
          ${isActive ? "bg-gray-100 text-proximo-700" : "text-gray-700 hover:bg-gray-100"}`}
      >
        <FolderIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-proximo-700" : "text-proximo-600"}`} />
        <span className="text-sm truncate min-w-0 flex-1">{item.name}</span>

        {(item.children?.length > 0 || item.has_children) && (
          <ChevronRightIcon className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""} opacity-40`} />
        )}
      </div>

      {isOpen && item.children?.length > 0 && (
        <ul className="ml-4 border-l border-gray-200 mt-0.5">
          {item.children.map((child) => (
            <NavItem
              key={child.path}
              item={child}
              activePath={activePath}
              openFolders={openFolders}
              setPath={setPath}
              toggleFolder={toggleFolder} // ⚡ passa para os filhos
            />
          ))}
        </ul>
      )}
    </li>
  );
}