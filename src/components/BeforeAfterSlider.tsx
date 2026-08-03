import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel?: string;
  processedLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  processedUrl,
  originalLabel = 'Original',
  processedLabel = 'Processed',
  className = '',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [activeDrag, setActiveDrag] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    setActiveDrag(true);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setActiveDrag(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setActiveDrag(true)}
      onTouchEnd={() => setActiveDrag(false)}
      onTouchMove={handleTouchMove}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 select-none cursor-ew-resize min-h-[250px] max-h-[550px] flex items-center justify-center ${className}`}
    >
      {/* Processed (Right/Bottom layer) */}
      <img
        src={processedUrl}
        alt="Processed"
        className="max-h-[500px] w-auto max-w-full object-contain pointer-events-none"
      />
      <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/10 shadow-lg">
        {processedLabel}
      </span>

      {/* Original (Left clipped overlay layer) */}
      <div
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img
          src={originalUrl}
          alt="Original"
          className="max-h-[500px] w-auto max-w-full object-contain pointer-events-none"
        />
        <span className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-md bg-indigo-950/80 backdrop-blur-md text-indigo-200 text-[11px] font-semibold tracking-wide border border-indigo-400/20 shadow-lg">
          {originalLabel}
        </span>
      </div>

      {/* Vertical Split Line Handle with Prominent Chevrons Indicator */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.6)] z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-indigo-600 text-white border-2 border-white shadow-2xl flex items-center justify-center transition-transform ${
            activeDrag ? 'scale-110 bg-indigo-500 ring-4 ring-indigo-500/30' : 'hover:scale-105'
          }`}
        >
          <ChevronsLeftRight className="w-4 h-4 text-white shrink-0" />
        </div>
      </div>
    </div>
  );
};
