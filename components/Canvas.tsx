"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconPointer } from "@tabler/icons-react";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import Color from "color";
import { Cursor, CursorFollow, CursorProvider } from "./ui/animated-cursor";
import { useColorStore } from "@/stores/providers/color-store-provider";
import { useMousePositionStore } from "@/stores/providers/mouse-position-store-provider";
import { buildRoomWsUrl } from "@/lib/collaboration/env";
import { ConnectionState, RealtimeClient } from "@/lib/collaboration/realtime-client";

const PIXEL_SIZE = 24;

const ANIMALS = ["Panda", "Tiger", "Otter", "Fox", "Dolphin", "Hawk", "Koala", "Lynx"];
const ADJECTIVES = ["Happy", "Swift", "Calm", "Curious", "Bold", "Mellow", "Clever", "Sunny"];
const USER_COLORS = ["#6366F1", "#F97316", "#10B981", "#EC4899", "#0EA5E9", "#A855F7"];

interface UserIdentity {
  name: string;
  colorHex: string;
}

interface PresenceState {
  user?: UserIdentity;
  cursor?: { x: number; y: number };
  drawing?: boolean;
}

interface RemoteCursor {
  id: string;
  name: string;
  colorHex: string;
  x: number;
  y: number;
}

export interface PresenceSnapshot {
  online: number;
  drawing: number;
  connection: ConnectionState;
}

interface CanvasProps {
  roomId: string;
  onPresenceChange?: (snapshot: PresenceSnapshot) => void;
}

function createIdentity(): UserIdentity {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const colorHex = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  return { name: `${adjective} ${animal}`, colorHex };
}

function toPixelKey(x: number, y: number): string {
  return `${x}:${y}`;
}

function parsePixelKey(key: string): { x: number; y: number } | null {
  const [xRaw, yRaw] = key.split(":");
  const x = Number(xRaw);
  const y = Number(yRaw);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return { x, y };
}

export default function Canvas({ roomId, onPresenceChange }: CanvasProps) {
  const { trackingRef, mouse } = useMousePositionStore();
  const { activeColor } = useColorStore();
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelsRef = useRef<Y.Map<string> | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const [localUser] = useState<UserIdentity>(() => createIdentity());
  const presenceRef = useRef<PresenceSnapshot>({
    online: 1,
    drawing: 0,
    connection: "connecting",
  });

  const emitPresence = useCallback(
    (next: Partial<PresenceSnapshot>) => {
      presenceRef.current = { ...presenceRef.current, ...next };
      onPresenceChange?.(presenceRef.current);
    },
    [onPresenceChange],
  );

  const redrawCanvas = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    const pixels = pixelsRef.current;
    if (!ctx || !canvas || !pixels) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [key, color] of pixels.entries()) {
      const point = parsePixelKey(key);
      if (!point) {
        continue;
      }
      ctx.fillStyle = color;
      ctx.fillRect(point.x, point.y, PIXEL_SIZE, PIXEL_SIZE);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    contextRef.current = ctx;
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redrawCanvas]);

  useEffect(() => {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    const pixels = doc.getMap<string>("pixels");
    pixelsRef.current = pixels;
    awarenessRef.current = awareness;

    const wsClient = new RealtimeClient({
      doc,
      awareness,
      roomWsUrl: buildRoomWsUrl(roomId),
      onConnectionStateChange: (state) => emitPresence({ connection: state }),
    });

    const reportPresence = () => {
      const states = awareness.getStates();
      const nextCursors: RemoteCursor[] = [];
      let online = 0;
      let drawing = 0;

      for (const [clientId, raw] of states.entries()) {
        const state = raw as PresenceState;
        if (!state.user) {
          continue;
        }

        online += 1;
        if (state.drawing) {
          drawing += 1;
        }

        if (clientId !== doc.clientID && state.cursor) {
          nextCursors.push({
            id: String(clientId),
            name: state.user.name,
            colorHex: state.user.colorHex,
            x: state.cursor.x,
            y: state.cursor.y,
          });
        }
      }

      setRemoteCursors(nextCursors);
      emitPresence({ online: Math.max(1, online), drawing });
    };

    const onPixelsChanged = () => redrawCanvas();
    const onAwarenessChanged = () => reportPresence();

    pixels.observe(onPixelsChanged);
    awareness.on("change", onAwarenessChanged);
    awareness.setLocalState({
      user: localUser,
      drawing: false,
    });

    wsClient.connect();
    reportPresence();
    redrawCanvas();

    return () => {
      pixels.unobserve(onPixelsChanged);
      awareness.off("change", onAwarenessChanged);
      wsClient.disconnect();
      pixelsRef.current = null;
      awarenessRef.current = null;
    };
  }, [roomId, redrawCanvas, emitPresence, localUser]);

  useEffect(() => {
    const awareness = awarenessRef.current;
    if (!awareness) {
      return;
    }

    if (typeof mouse.elementX !== "number" || typeof mouse.elementY !== "number") {
      return;
    }

    awareness.setLocalStateField("cursor", {
      x: Math.max(0, Math.round(mouse.elementX)),
      y: Math.max(0, Math.round(mouse.elementY)),
    });
  }, [mouse.elementX, mouse.elementY]);

  const fillPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const pixels = pixelsRef.current;
    const awareness = awarenessRef.current;
    if (!rect || !pixels || !awareness) {
      return;
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixelX = Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE;
    const pixelY = Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE;

    awareness.setLocalStateField("drawing", true);
    const colorHex = Color(activeColor.value).hex().toUpperCase();
    pixels.set(toPixelKey(pixelX, pixelY), colorHex);

    window.setTimeout(() => {
      awareness.setLocalStateField("drawing", false);
    }, 120);
  };

  return (
    <main className="relative w-screen h-screen pt-16 bg-slate-50 overflow-hidden cursor-none">
      <div className="absolute inset-0 bg-white pixel-grid pointer-events-none"></div>
      <CursorProvider>
        <div ref={trackingRef} className="w-full h-full">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" onClick={fillPixel} />
        </div>
        <Cursor>
          <IconPointer
            className="drop-shadow-sm"
            style={{ color: localUser.colorHex }}
            size={30}
            stroke={2}
            fill="currentColor"
          />
        </Cursor>
        <CursorFollow align="bottom-right">
          <div className="rounded-full px-2 py-1 text-xs text-white" style={{ backgroundColor: localUser.colorHex }}>
            {localUser.name}
          </div>
        </CursorFollow>
      </CursorProvider>

      {remoteCursors.map((cursor) => (
        <div key={cursor.id} className="custom-cursor" style={{ top: cursor.y, left: cursor.x }}>
          <IconPointer
            className="drop-shadow-sm"
            style={{ color: cursor.colorHex }}
            size={30}
            stroke={2}
            fill="currentColor"
          />
          <div
            className="ml-4 mt-1 px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap"
            style={{ backgroundColor: cursor.colorHex }}
          >
            <span>{cursor.name}</span>
          </div>
        </div>
      ))}
    </main>
  );
}
