import { IconPencil, IconEraser, IconPaint, IconColorPicker, IconZoomIn, IconZoomOut } from '@tabler/icons-react';

export default function Tools() {
  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-40">
      <button className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform active:scale-90" title="Pencil (P)">
        <IconPencil size={24} stroke={2} />
      </button>
      <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-500" title="Eraser (E)">
        <IconEraser size={24} stroke={2} />
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
