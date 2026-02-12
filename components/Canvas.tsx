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
  rotationDeg: number;
}

interface GestureState {
  mode: "none" | "pan" | "pinch";
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialScale: number;
  initialRotationDeg: number;
  initialDistance: number;
  initialAngleDeg: number;
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(t1: GestureTouchPoint, t2: GestureTouchPoint): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.hypot(dx, dy);
}

function touchAngleDeg(t1: GestureTouchPoint, t2: GestureTouchPoint): number {
  return (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) / Math.PI;
}

function touchMidpoint(t1: GestureTouchPoint, t2: GestureTouchPoint): { x: number; y: number } {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
}

function renderGrid(context: CanvasRenderingContext2D): void {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.strokeStyle = "#e2e8f0";
  context.lineWidth = 1;
  for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, CANVAS_HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(CANVAS_WIDTH, y + 0.5);
    context.stroke();
  }
}

export default function Canvas({ roomId, onPresenceChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gestureRef = useRef<GestureState>({
    mode: "none",
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialScale: 1,
    initialRotationDeg: 0,
    initialDistance: 0,
    initialAngleDeg: 0,
    initialMidX: 0,
    initialMidY: 0,
  });
  const { trackingRef } = useMousePositionStore();
  const [view, setView] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: 1,
    rotationDeg: 0,
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
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    renderGrid(context);
  }, []);

  const transform = useMemo(
    () =>
      `translate(-50%, -50%) translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale}) rotate(${view.rotationDeg}deg)`,
    [view],
  );

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      gestureRef.current = {
        ...gestureRef.current,
        mode: "pan",
        startX: touch.clientX,
        startY: touch.clientY,
        initialX: view.x,
        initialY: view.y,
      };
      return;
    }

    if (event.touches.length >= 2) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const midpoint = touchMidpoint(t1, t2);
      gestureRef.current = {
        ...gestureRef.current,
        mode: "pinch",
        initialX: view.x,
        initialY: view.y,
        initialScale: view.scale,
        initialRotationDeg: view.rotationDeg,
        initialDistance: touchDistance(t1, t2),
        initialAngleDeg: touchAngleDeg(t1, t2),
        initialMidX: midpoint.x,
        initialMidY: midpoint.y,
      };
    }
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const gesture = gestureRef.current;

    if (gesture.mode === "pan" && event.touches.length === 1) {
      const touch = event.touches[0];
      setView((previous) => ({
        ...previous,
        x: gesture.initialX + (touch.clientX - gesture.startX),
        y: gesture.initialY + (touch.clientY - gesture.startY),
      }));
      return;
    }

    if (gesture.mode === "pinch" && event.touches.length >= 2) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const nextDistance = touchDistance(t1, t2);
      const nextAngleDeg = touchAngleDeg(t1, t2);
      const midpoint = touchMidpoint(t1, t2);
      const ratio = gesture.initialDistance > 0 ? nextDistance / gesture.initialDistance : 1;

      setView({
        x: gesture.initialX + (midpoint.x - gesture.initialMidX),
        y: gesture.initialY + (midpoint.y - gesture.initialMidY),
        scale: clamp(gesture.initialScale * ratio, MIN_SCALE, MAX_SCALE),
        rotationDeg: gesture.initialRotationDeg + (nextAngleDeg - gesture.initialAngleDeg),
      });
    }
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 0) {
      gestureRef.current.mode = "none";
      return;
    }
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      gestureRef.current = {
        ...gestureRef.current,
        mode: "pan",
        startX: touch.clientX,
        startY: touch.clientY,
        initialX: view.x,
        initialY: view.y,
      };
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
