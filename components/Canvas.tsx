'use client';

import { useRef, useEffect, useState } from 'react';
import { IconPointer } from '@tabler/icons-react';

interface Cursor {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  x: number;
  y: number;
}

const collaborativeCursors: Cursor[] = [
  { id: '1', name: 'Sleepy Sloth', color: 'indigo', colorHex: '#6366f1', x: 25, y: 35 },
  { id: '2', name: 'Jolly Giraffe', color: 'orange', colorHex: '#f97316', x: 65, y: 55 },
  { id: '3', name: 'Dapper Duck', color: 'emerald', colorHex: '#10b981', x: 70, y: 20 },
];

const PIXEL_SIZE = 24; // Size of each pixel square
const currentUser = { name: 'Happy Panda', color: 'purple', colorHex: '#a855f7' }; // Current user

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // Current user cursor position in %
  const [currentColor, setCurrentColor] = useState('#0F172A');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw pixel grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.5;

      for (let x = 0; x <= canvas.width; x += PIXEL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += PIXEL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    resizeCanvas();
    contextRef.current = ctx;

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Update cursor position as percentage for positioning
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: xPercent, y: yPercent });
  };

  const fillPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which pixel grid to fill
    const pixelX = Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE;
    const pixelY = Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE;

    // Fill the pixel
    contextRef.current.fillStyle = currentColor;
    contextRef.current.fillRect(pixelX, pixelY, PIXEL_SIZE, PIXEL_SIZE);
  };

  return (
    <main className="relative w-screen h-screen pt-16 bg-slate-50 overflow-hidden cursor-crosshair">
      <div className="absolute inset-0 bg-white pixel-grid pointer-events-none"></div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={fillPixel}
        onMouseMove={handleMouseMove}
      />

      {/* Current User Cursor */}
      <div
        className="custom-cursor pointer-events-none"
        style={{ top: `${mousePos.y}%`, left: `${mousePos.x}%` }}
      >
        <IconPointer
          className="drop-shadow-sm"
          style={{ color: currentUser.colorHex }}
          size={30}
          stroke={2}
          fill="currentColor"
        />
        <div
          className="ml-4 mt-1 px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap"
          style={{ backgroundColor: currentUser.colorHex }}
        >
          <span>{currentUser.name} (You)</span>
        </div>
      </div>

      {/* Collaborative Cursors */}
      {collaborativeCursors.map((cursor) => (
        <div
          key={cursor.id}
          className="custom-cursor"
          style={{ top: `${cursor.y}%`, left: `${cursor.x}%` }}
        >
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

      {/* Canvas Boundary */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 border border-slate-200/50 pointer-events-none"></div>
    </main>
  );
}
