"use client";

import { useMemo, useState } from "react";
import { IconGridDots, IconLogout, IconShare } from "@tabler/icons-react";
import type { ConnectionState } from "@/lib/collaboration/realtime-client";

interface HeaderProps {
  roomId?: string;
  onlineUsers?: number;
  drawingUsers?: number;
  connectionState?: ConnectionState;
  shareUrl?: string;
  onLeaveRoom?: () => void;
}

function statusColor(connectionState: ConnectionState): string {
  if (connectionState === "connected") {
    return "bg-emerald-500";
  }
  if (connectionState === "connecting") {
    return "bg-amber-500";
  }
  return "bg-rose-500";
}

export default function Header({
  roomId,
  onlineUsers = 0,
  drawingUsers = 0,
  connectionState = "disconnected",
  shareUrl,
  onLeaveRoom,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const canShare = Boolean(shareUrl && shareUrl.length > 0);
  const buttonLabel = useMemo(() => (copied ? "Copied" : "Share"), [copied]);

  const onShare = async () => {
    if (!shareUrl || !navigator?.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-18 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
          <IconGridDots size={20} stroke={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-800">PixelCollab</h1>
          <p className="text-[10px] text-primary uppercase tracking-widest font-bold">
            {roomId ? `Room: ${roomId}` : "Canvas: Fresh Start"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full animate-pulse ${statusColor(connectionState)}`}></span>
            <span className="text-xs font-semibold text-slate-600">{onlineUsers} users online</span>
          </div>
          <div className="w-px h-3 bg-slate-300"></div>
          <div className="text-xs font-medium text-slate-400">{drawingUsers} users drawing</div>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <button
          type="button"
          onClick={onShare}
          disabled={!canShare}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm font-bold shadow-sm shadow-primary/20"
        >
          <IconShare size={20} stroke={2} />
          {buttonLabel}
        </button>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm font-bold"
        >
          <IconLogout size={18} stroke={2} />
          Leave
        </button>
      </div>
    </header>
  );
}
