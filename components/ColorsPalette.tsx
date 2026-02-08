import { IconPlus } from '@tabler/icons-react';

export default function ColorsPalette() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40">
      <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
        <div className="size-10 rounded-lg bg-slate-900 border border-slate-200 shadow-inner cursor-pointer"></div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
          <span className="text-xs font-mono font-bold text-slate-700">#0F172A</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button className="size-8 rounded-md bg-rose-500 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-amber-500 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-yellow-400 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-emerald-500 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-sky-500 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-indigo-500 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-slate-900 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md bg-white border border-slate-200 hover:scale-110 transition-transform"></button>
        <button className="size-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400">
          <IconPlus size={16} stroke={2} />
        </button>
      </div>
    </div>
  );
}
