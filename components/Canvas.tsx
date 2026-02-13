"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import type { ConnectionState } from "@/lib/collaboration/realtime-client";
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

function fillPixel(
  ctx: CanvasRenderingContext2D,
  clientX: number,
  clientY: number,
  view: ViewportState,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();

  // Convert screen → canvas coordinates
  const x =
    (clientX - rect.left - rect.width / 2 - view.x) / view.scale +
    CANVAS_WIDTH / 2;

  const y =
    (clientY - rect.top - rect.height / 2 - view.y) / view.scale +
    CANVAS_HEIGHT / 2;

  const snappedX = Math.floor(x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.floor(y / GRID_SIZE) * GRID_SIZE;

  ctx.fillStyle = "#000000";
  ctx.fillRect(snappedX, snappedY, GRID_SIZE, GRID_SIZE);
}

export default function Canvas({ roomId, onPresenceChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gestureRef = useRef<GestureState>({
    mode: "none",
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

  useEffect(() => {
    onPresenceChange?.({
      online: 1,
      drawing: 0,
      connection: roomId.length > 0 ? "connected" : "disconnected",
    });
  }, [onPresenceChange, roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderGrid(ctx);
  }, []);

  const transform = useMemo(
    () =>
      `translate(-50%, -50%) translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
    [view],
  );

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (event.touches.length === 1) {
      const touch = event.touches[0];

      gestureRef.current.mode = "draw";

      fillPixel(ctx, touch.clientX, touch.clientY, view, canvas);
      return;
    }

    if (event.touches.length >= 2) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const midpoint = touchMidpoint(t1, t2);

      gestureRef.current = {
        mode: "two",
        initialX: view.x,
        initialY: view.y,
        initialScale: view.scale,
        initialDistance: touchDistance(t1, t2),
        initialMidX: midpoint.x,
        initialMidY: midpoint.y,
      };
    }
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    event.preventDefault();

    const gesture = gestureRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (gesture.mode === "draw" && event.touches.length === 1) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const touch = event.touches[0];
      fillPixel(ctx, touch.clientX, touch.clientY, view, canvas);
      return;
    }

    if (gesture.mode === "two" && event.touches.length >= 2) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];

      const midpoint = touchMidpoint(t1, t2);
      const distance = touchDistance(t1, t2);

      const ratio =
        gesture.initialDistance > 0
          ? distance / gesture.initialDistance
          : 1;

      setView({
        x: gesture.initialX + (midpoint.x - gesture.initialMidX),
        y: gesture.initialY + (midpoint.y - gesture.initialMidY),
        scale: clamp(
          gesture.initialScale * ratio,
          MIN_SCALE,
          MAX_SCALE,
        ),
      });
    }
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 0) {
      gestureRef.current.mode = "none";
    }
  };

  return (
    <div
      ref={trackingRef}
      className="fixed inset-0 top-18 overflow-hidden bg-slate-100"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
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