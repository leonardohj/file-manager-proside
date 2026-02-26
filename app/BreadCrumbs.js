import React from "react";
import { ChevronRight } from 'lucide-react';

export default function BreadCrumbs({ path, onNavigate, setPath }) {
  // .filter(Boolean) removes empty strings if path starts/ends with '/'
  const segments = path.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-white">
      {segments.map((seg, index) => {
        // Build the full path for this specific button
        // If segments are ['conteudos', 'fotos', 'verao'], index 1 is 'conteudos/fotos'
        const cumulativePath = segments.slice(0, index + 1).join('/');

        return (
          <div className="flex items-center gap-1" key={cumulativePath}>
            {index > 0 && (
              <ChevronRight size={14} className="opacity-40" />
            )}
            
            <button 
              onClick={() => setPath(cumulativePath)}
              className={`
                cursor-pointer transition-colors text-sm
                ${index === segments.length - 1 ? 'font-medium ' : 'hover:opacity-100 hover:underline'}
              `}
            >
              {seg}
            </button>
          </div>
        );
      })}
    </nav>
  );
}