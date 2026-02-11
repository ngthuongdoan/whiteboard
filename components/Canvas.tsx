'use client';

import { useRef, useEffect } from 'react';
import { IconPointer } from '@tabler/icons-react';
import { Cursor, CursorFollow, CursorProvider } from './ui/animated-cursor';
import { useColorStore } from '@/stores/providers/color-store-provider';
import { useMousePositionStore } from '@/stores/providers/mouse-position-store-provider';
import Color from 'color';

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
  const { trackingRef } = useMousePositionStore();
  const { activeColor } = useColorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

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
    };

    resizeCanvas();
    contextRef.current = ctx;

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

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
    contextRef.current.fillStyle = Color(activeColor.value).hex();
    contextRef.current.fillRect(pixelX, pixelY, PIXEL_SIZE, PIXEL_SIZE);
  };

  return (
    <main className="relative w-screen h-screen pt-16 bg-slate-50 overflow-hidden cursor-none">
      <div className="absolute inset-0 bg-white pixel-grid pointer-events-none"></div>
      <CursorProvider>
        {/* Canvas Element */}
        <div ref={trackingRef} className='w-full h-full'>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onClick={fillPixel}
          />
        </div>
        <Cursor>
          <IconPointer
            className="drop-shadow-sm"
            style={{ color: currentUser.colorHex }}
            size={30}
            stroke={2}
            fill="currentColor"
          />
        </Cursor>
        <CursorFollow align="bottom-right">
          <div className="rounded-full px-2 py-1 text-xs text-white"
            style={{ backgroundColor: currentUser.colorHex }}
          >
            {currentUser.name}
          </div>
        </CursorFollow>
      </CursorProvider>
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
      {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 border border-slate-200/50 pointer-events-none"></div> */}
    </main>
  );
}
