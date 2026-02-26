"use client";
import SearchComponent from "./SearchComponent";
import BreadCrumbs from "./BreadCrumbs";
import { useState, useEffect } from "react";
import Filters from "./Filters";
import Files from "./Files";
import AddFile from "./AddFile";
import NavItem from "./NavItem";
import {
  Bars3Icon,
  ArrowsPointingInIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";

export default function FileManager() {
  const [path, setPath] = useState("conteudos");
  const [tree, setTree] = useState([]);
  const [openFolders, setOpenFolders] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // exemplo para viewOptions
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    file: null
  });

  const showSidebar = true;

  const toggleFolder = (folderPath) => {
    setOpenFolders((prev) =>
      prev.includes(folderPath)
        ? prev.filter((p) => p !== folderPath)
        : [...prev, folderPath]
    );
  };

  const fetchTree = async () => {
    try {
      const openParam = openFolders.join(",");
      const res = await fetch(`/api/files/tree?openFolders=${openParam}`);
      const data = await res.json();
      setTree(data);
    } catch (err) {
      console.error("Erro a buscar árvore de pastas:", err);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [openFolders, refreshCounter]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <div className="bg-proximo-800 select-none p-2 flex justify-between items-center text-white z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-proximo-700 rounded transition-colors focus:outline-none">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <img src="/logo.png" className="h-7" alt="Proximo" />
        </div>
        <SearchComponent />
      </div>

      <div className="flex h-full overflow-hidden">
        <div
          className={`select-none transition-all duration-300 ease-in-out border-r-2 border-proximo-800 flex flex-col bg-white overflow-hidden ${
            showSidebar ? "w-72" : "w-0"
          }`}
        >
          <div className="bg-proximo-700 font-semibold text-white px-4 h-9 flex justify-between items-center whitespace-nowrap">
            <span>Diretórios</span>
            <button className="p-1 hover:bg-proximo-600 rounded transition-colors group">
              <ArrowsPointingInIcon className="w-4 h-4 text-white/80 group-hover:text-white" />
            </button>
          </div>

          <div className="p-2 flex-1">
            <div className="w-[264px]">
              <div
                onClick={() => setPath("conteudos")}
                className={`flex items-center gap-2 px-2 py-1.5 mb-1 cursor-pointer rounded-md transition-all ${
                  path === "conteudos"
                    ? "bg-gray-100 text-proximo-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <HomeIcon className="h-4 w-4 shrink-0 text-proximo-600" />
                <span className="text-sm truncate min-w-0 flex-1">
                  conteudos
                </span>
              </div>

              <ul className="ml-4">
                {tree.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    activePath={path}
                    setPath={setPath}
                    openFolders={openFolders}
                    toggleFolder={toggleFolder} // ← aqui
                    setSelected={setSelected}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between select-none bg-proximo-700 text-white min-h-[36px] max-h-[36px] items-center px-4 shadow-inner">
            <BreadCrumbs path={path} setPath={setPath} />
            <Filters filter={filter} setFilter={setFilter} viewMode={viewMode} setViewMode={setViewMode}/>
          </div>

          <div className="overflow-y-auto h-full w-full">
            <Files setPath={setPath} path={path} refreshCounter={refreshCounter} filter={filter} viewMode={viewMode} selected={selected} setSelected={setSelected} contextMenu={contextMenu} setContextMenu={setContextMenu}/>
          </div>
        </div>

        <AddFile path={path} setRefreshCounter={setRefreshCounter} />
      </div>
    </div>
  );
}
