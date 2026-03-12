'use client';

import { useEffect } from 'react';
import { IconPencil, IconEraser, IconPaint, IconColorPicker, IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import { useDrawingToolStore } from '@/stores/drawing-tool-store';

interface ToolsProps {
  collapsed?: boolean;
}

export default function Tools({ collapsed = false }: ToolsProps) {
  const activeTool = useDrawingToolStore((state) => state.activeTool);
  const setActiveTool = useDrawingToolStore((state) => state.setActiveTool);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        setActiveTool('pencil');
      }

      if (event.key.toLowerCase() === 'e') {
        setActiveTool('eraser');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveTool]);

  return (
    <nav
      className={`fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 transition-transform duration-300 ${collapsed ? '-translate-x-28' : 'translate-x-0'}`}
    >
      <button
        type="button"
        onClick={() => setActiveTool('pencil')}
        className={`p-3 rounded-xl transition-transform active:scale-90 ${activeTool === 'pencil'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'hover:bg-slate-100 text-slate-500'
          }`}
        title="Pencil (P)"
      >
        <IconPencil size={24} stroke={2} />
      </button>
      <button
        type="button"
        onClick={() => setActiveTool('eraser')}
        className={`p-3 rounded-xl transition-colors ${activeTool === 'eraser'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'hover:bg-slate-100 text-slate-500'
          }`}
        title="Eraser (E)"
      >
        <IconEraser className="tabler-icon tabler-icon-eraser" size={24} stroke={2} />
      </button>
      <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-500" title="Fill (F)">
        <IconPaint size={24} stroke={2} />
      </button>
      <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-500" title="Eye Dropper (I)">
        <IconColorPicker size={24} stroke={2} />
      </button>

      <hr className="h-px bg-slate-100 border-[slate-100] my-1 mx-2" />

      <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-500" title="Zoom In (+)">
        <IconZoomIn size={24} stroke={2} />
      </button>
      <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-500" title="Zoom Out (-)">
        <IconZoomOut size={24} stroke={2} />
      </button>
    </nav>
  );
}
