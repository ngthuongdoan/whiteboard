import React, { useRef, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const draw = (x, y) => {
      context.fillStyle = 'black';
      context.fillRect(x, y, 5, 5);
    };

    let isDrawing = false;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        isDrawing = true;
      }
    };

    const handleTouchEnd = () => {
      isDrawing = false;
    };

    const handleTouchMove = (e) => {
      if (!isDrawing) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default Canvas;