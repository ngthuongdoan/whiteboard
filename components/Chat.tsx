import { IconMessage } from '@tabler/icons-react';

export default function Chat() {
  return (
    <div className="fixed top-20 right-8 z-40">
      <button className="size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-lg hover:bg-slate-50 transition-colors group">
        <IconMessage size={24} stroke={2} />
        <div className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
          2
        </div>
      </button>
    </div>
  );
}
