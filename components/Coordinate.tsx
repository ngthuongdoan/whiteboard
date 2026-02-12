"use client";
import { useMousePositionStore } from '@/stores/providers/mouse-position-store-provider';
import { IconArrowBackUp } from '@tabler/icons-react';

interface CoordinateProps {
  collapsed?: boolean;
}

export default function Coordinate({ collapsed = false }: CoordinateProps) {
  const { mouse } = useMousePositionStore();
  // i think we need to have the isInside to prevent negative coordinates
  const isInside =
    mouse.elementX !== undefined &&
    mouse.elementY !== undefined &&
    mouse.elementX >= 0 &&
    mouse.elementY >= 0;

  return (
    <div className={`fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40 transition-transform duration-300 ${collapsed ? 'translate-x-36 translate-y-28' : 'translate-x-0 translate-y-0'}`}>
      <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-tighter">Pos</span>
          <span className="text-slate-900 font-mono">{isInside ? `${mouse.elementX}, ${mouse.elementY}` : '-'}</span>
        </div>
        <div className="w-px h-3 bg-slate-100"></div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-tighter">Zoom</span>
          <span className="text-slate-900 font-mono">100%</span>
        </div>
        <div className="w-px h-3 bg-slate-100"></div>
        <button className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity">
          <IconArrowBackUp size={14} stroke={2} />
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
}
