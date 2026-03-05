"use client";
import { FunnelIcon, BarsArrowUpIcon, BarsArrowDownIcon, Squares2X2Icon, FolderIcon, PhotoIcon, VideoCameraIcon, ListBulletIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useFileManagerContext } from "./FileManagerContext";

export default function Filters() {
  const {filter, setFilter, viewMode, setViewMode} = useFileManagerContext();

  const [openFilter, setOpenFilter] = useState(false);


  const filterOptions = {
    ordenar: [
      { id: 'az', label: 'A-Z', icon: BarsArrowDownIcon, color: 'text-proximo-600' },
      { id: 'za', label: 'Z-A', icon: BarsArrowUpIcon, color: 'text-proximo-600' },
    ],
    filtrar: [
      { id: 'all', label: 'Tudo', icon: Squares2X2Icon, color: 'text-proximo-600' },
      { id: 'folders', label: 'Pastas', icon: FolderIcon, color: 'text-amber-500' },
      { id: 'images', label: 'Imagens', icon: PhotoIcon, color: 'text-blue-500' },
      { id: 'videos', label: 'Vídeos', icon: VideoCameraIcon, color: 'text-red-500' },
    ],
  };

  const viewOptions = [
    { id: 'grid', label: 'Em Grelha', icon: Squares2X2Icon },
    { id: 'list', label: 'Em Lista', icon: ListBulletIcon }, // substitui com icon real
  ];

  // Para obter label do filtro ativo
  const allOptions = Object.values(filterOptions).flat();
  const activeLabel = allOptions.find(opt => opt.id === filter)?.label ?? 'Filtros';

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="relative">
        <button
          onClick={() => setOpenFilter(!openFilter)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors border border-white/20 text-white"
        >
          <FunnelIcon fill="white" className="w-3.5 h-3.5" />
          <span className="capitalize">{activeLabel}</span>
        </button>

        {openFilter && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[50] text-gray-700"
          >
            {Object.entries(filterOptions).map(([title, options], index) => (
              <div key={index}>
                <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                  {title === 'ordenar' ? 'Ordenar por' : 'Filtrar conteúdo'}
                </div>
                {options.map((opt, idx) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setFilter(opt.id);
                        setOpenFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                        filter === opt.id
                          ? 'bg-gray-100 font-semibold text-proximo-900'
                          : 'hover:bg-proximo-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${opt.color}`} />
                      {opt.label}
                    </button>
                  );
                })}
                <div className="h-px bg-gray-100 my-1.5 mx-2"></div>
              </div>
            ))}

            <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Modo de Exibição
            </div>
            {viewOptions.map((vOpt, idx) => {
              const Icon = vOpt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setViewMode(vOpt.id);
                    setOpenFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === vOpt.id
                      ? 'bg-gray-100 font-semibold text-proximo-900'
                      : 'hover:bg-proximo-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  {vOpt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}