"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { buildRoomWsUrl } from "@/lib/collaboration/env";
import { RealtimeClient, type ConnectionState } from "@/lib/collaboration/realtime-client";
import { useMousePositionStore } from "@/stores/providers/mouse-position-store-provider";

export interface PresenceSnapshot {
  online: number;
  drawing: number;
  connection: ConnectionState;
}

interface CanvasProps {
  roomId: string;
  onPresenceChange?: (presence: PresenceSnapshot) => void;
}

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

interface GestureState {
  mode: "none" | "draw" | "two";
  drawingPointerId: number | null;
  initialX: number;
  initialY: number;
  initialScale: number;
  initialDistance: number;
  initialMidX: number;
  initialMidY: number;
}

interface GestureTouchPoint {
  clientX: number;
  clientY: number;
}

const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1600;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3.5;
const GRID_SIZE = 40;
const PIXELS_MAP_NAME = "pixels";
const DEFAULT_PIXEL_COLOR = "#000000";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(t1: GestureTouchPoint, t2: GestureTouchPoint): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.hypot(dx, dy);
}

function touchMidpoint(
  t1: GestureTouchPoint,
  t2: GestureTouchPoint,
): { x: number; y: number } {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

function renderGrid(context: CanvasRenderingContext2D): void {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.strokeStyle = "#e2e8f0";
  context.lineWidth = 1;

  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, CANVAS_HEIGHT);
    context.stroke();
  }

  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(CANVAS_WIDTH, y + 0.5);
    context.stroke();
  }
}

function getSnappedCell(
  clientX: number,
  clientY: number,
  view: ViewportState,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();

  // Convert screen to canvas coordinates before snapping to the grid.
  const x =
    (clientX - rect.left - rect.width / 2 - view.x) / view.scale +
    CANVAS_WIDTH / 2;

  const y =
    (clientY - rect.top - rect.height / 2 - view.y) / view.scale +
    CANVAS_HEIGHT / 2;

  return {
    x: Math.floor(x / GRID_SIZE) * GRID_SIZE,
    y: Math.floor(y / GRID_SIZE) * GRID_SIZE,
  };
}

function paintCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
}

export default function Canvas({ roomId, onPresenceChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointersRef = useRef<Map<number, GestureTouchPoint>>(new Map());
  const pixelsRef = useRef<Y.Map<string> | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const connectionStateRef = useRef<ConnectionState>("connecting");

  const gestureRef = useRef<GestureState>({
    mode: "none",
    drawingPointerId: null,
    initialX: 0,
    initialY: 0,
    initialScale: 1,
    initialDistance: 0,
    initialMidX: 0,
    initialMidY: 0,
  });

  const { trackingRef } = useMousePositionStore();

  const [view, setView] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const viewRef = useRef(view);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    const pixels = doc.getMap<string>(PIXELS_MAP_NAME);
    awareness.setLocalStateField("drawing", false);

    const publishPresence = () => {
      const states = Array.from(awareness.getStates().values()) as Array<{ drawing?: boolean }>;
      onPresenceChange?.({
        online: states.length,
        drawing: states.filter((state) => Boolean(state?.drawing)).length,
        connection: connectionStateRef.current,
      });
    };

    const renderSharedPixels = () => {
      renderGrid(ctx);
      pixels.forEach((color, key) => {
        const [xRaw, yRaw] = key.split(",");
        const x = Number(xRaw);
        const y = Number(yRaw);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          return;
        }
        paintCell(ctx, x, y, color);
      });
    };

    connectionStateRef.current = "connecting";
    awarenessRef.current = awareness;
    pixelsRef.current = pixels;
    awareness.on("change", publishPresence);
    pixels.observe(renderSharedPixels);
    publishPresence();
    renderSharedPixels();

    const realtimeClient = new RealtimeClient({
      doc,
      awareness,
      roomWsUrl: buildRoomWsUrl(roomId),
      onConnectionStateChange: (state) => {
        connectionStateRef.current = state;
        publishPresence();
      },
    });

    realtimeClient.connect();

    return () => {
      pixels.unobserve(renderSharedPixels);
      awareness.off("change", publishPresence);
      realtimeClient.disconnect();
      awarenessRef.current = null;
      pixelsRef.current = null;
      connectionStateRef.current = "disconnected";
    };
  }, [onPresenceChange, roomId]);

  const transform = useMemo(
    () =>
      `translate(-50%, -50%) translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
    [view],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    activePointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    event.currentTarget.setPointerCapture(event.pointerId);

    const pointers = Array.from(activePointersRef.current.values());
    const currentView = viewRef.current;

    if (pointers.length === 1) {
      gestureRef.current.mode = "draw";
      gestureRef.current.drawingPointerId = event.pointerId;
      awarenessRef.current?.setLocalStateField("drawing", true);

      const snapped = getSnappedCell(event.clientX, event.clientY, currentView, canvas);
      pixelsRef.current?.set(`${snapped.x},${snapped.y}`, DEFAULT_PIXEL_COLOR);
      paintCell(ctx, snapped.x, snapped.y, DEFAULT_PIXEL_COLOR);
      return;
    }

    if (pointers.length >= 2) {
      const [t1, t2] = pointers;
      const midpoint = touchMidpoint(t1, t2);

      gestureRef.current = {
        mode: "two",
        drawingPointerId: null,
        initialX: currentView.x,
        initialY: currentView.y,
        initialScale: currentView.scale,
        initialDistance: touchDistance(t1, t2),
        initialMidX: midpoint.x,
        initialMidY: midpoint.y,
      };
      awarenessRef.current?.setLocalStateField("drawing", false);
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const gesture = gestureRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!activePointersRef.current.has(event.pointerId)) return;

    activePointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    const pointers = Array.from(activePointersRef.current.values());

    if (
      gesture.mode === "draw" &&
      gesture.drawingPointerId === event.pointerId &&
      pointers.length === 1
    ) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const snapped = getSnappedCell(event.clientX, event.clientY, viewRef.current, canvas);
      pixelsRef.current?.set(`${snapped.x},${snapped.y}`, DEFAULT_PIXEL_COLOR);
      paintCell(ctx, snapped.x, snapped.y, DEFAULT_PIXEL_COLOR);
      return;
    }

    if (gesture.mode === "two" && pointers.length >= 2) {
      const [t1, t2] = pointers;

      const midpoint = touchMidpoint(t1, t2);
      const distance = touchDistance(t1, t2);

      const ratio =
        gesture.initialDistance > 0
          ? distance / gesture.initialDistance
          : 1;

      const nextView = {
        x: gesture.initialX + (midpoint.x - gesture.initialMidX),
        y: gesture.initialY + (midpoint.y - gesture.initialMidY),
        scale: clamp(
          gesture.initialScale * ratio,
          MIN_SCALE,
          MAX_SCALE,
        ),
      };

      viewRef.current = nextView;
      setView(nextView);
    }
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.delete(event.pointerId);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const remaining = activePointersRef.current.size;

    if (remaining === 0) {
      gestureRef.current.mode = "none";
      gestureRef.current.drawingPointerId = null;
      awarenessRef.current?.setLocalStateField("drawing", false);
      return;
    }

    if (remaining === 1) {
      const [pointerId] = activePointersRef.current.keys();
      gestureRef.current.mode = "draw";
      gestureRef.current.drawingPointerId = pointerId;
      awarenessRef.current?.setLocalStateField("drawing", true);
    }
  };

  return (
    <div
      ref={trackingRef}
      className="fixed inset-0 top-18 overflow-hidden bg-slate-100"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      style={{ touchAction: "none" }}
      aria-label="Collaborative canvas"
      role="img"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute left-1/2 top-1/2 max-w-none rounded-xl border border-slate-300 shadow-sm"
        style={{
          transform,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
