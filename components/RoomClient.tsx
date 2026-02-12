"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import Canvas, { type PresenceSnapshot } from "@/components/Canvas";
import Header from "@/components/Header";
import Tools from "@/components/Tools";
import ColorsPalette from "@/components/ColorsPalette";
import Chat from "@/components/Chat";
import Coordinate from "@/components/Coordinate";
import { MousePositionStoreProvider } from "@/stores/providers/mouse-position-store-provider";

interface RoomClientProps {
  roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
  const router = useRouter();
  const [isUiCollapsed, setIsUiCollapsed] = useState(false);
  const [presence, setPresence] = useState<PresenceSnapshot>({
    online: 1,
    drawing: 0,
    connection: "connecting",
  });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/room/${roomId}`;
  }, [roomId]);

  return (
    <div className="bg-slate-50 font-display text-slate-900 overflow-hidden selection:bg-primary/20">
      <Header
        roomId={roomId}
        onlineUsers={presence.online}
        drawingUsers={presence.drawing}
        connectionState={presence.connection}
        shareUrl={shareUrl}
        onLeaveRoom={() => router.push("/")}
      />
      <MousePositionStoreProvider>
        <Canvas roomId={roomId} onPresenceChange={setPresence} />
        <Tools collapsed={isUiCollapsed} />
        <ColorsPalette collapsed={isUiCollapsed} />
        <Coordinate collapsed={isUiCollapsed} />
        <Chat collapsed={isUiCollapsed} />
      </MousePositionStoreProvider>
      <button
        type="button"
        onClick={() => setIsUiCollapsed((previous) => !previous)}
        className="fixed top-20 left-6 z-50 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
        aria-label={isUiCollapsed ? "Show tools" : "Hide tools"}
      >
        {isUiCollapsed ? (
          <IconLayoutSidebarLeftExpand size={16} stroke={2.2} />
        ) : (
          <IconLayoutSidebarLeftCollapse size={16} stroke={2.2} />
        )}
        {isUiCollapsed ? "Show UI" : "Focus Canvas"}
      </button>
    </div>
  );
}
