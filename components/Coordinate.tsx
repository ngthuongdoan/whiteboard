import { IconArrowBackUp } from '@tabler/icons-react';

export default function Coordinate() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-40">
      <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-tighter">Pos</span>
          <span className="text-slate-900 font-mono">0, 0</span>
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
