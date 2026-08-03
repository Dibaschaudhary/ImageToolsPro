import React, { useRef, useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, Clipboard, Sparkles } from 'lucide-react';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  acceptedFormats?: string[];
  title?: string;
  subtitle?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelected,
  acceptedFormats,
  title = 'Drag & drop image here',
  subtitle = 'or click to browse from device',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Keep a stable ref to onFileSelected to prevent event listener thrashing/leaks
  const onFileSelectedRef = useRef(onFileSelected);
  useEffect(() => {
    onFileSelectedRef.current = onFileSelected;
  }, [onFileSelected]);

  // Clipboard Paste listener (Ctrl+V) attached once
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            onFileSelectedRef.current(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelected(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  // Sample placeholder generator for quick testing
  const handleLoadSample = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    
    // Draw nice gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(0.5, '#06b6d4');
    grad.addColorStop(1, '#10b981');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Decorative shape
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(400, 300, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ImageTools Pro Sample', 400, 290);
    ctx.font = '18px sans-serif';
    ctx.fillText('800 x 600 px • High Resolution Test Asset', 400, 330);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'sample-photo.png', { type: 'image/png' });
        onFileSelected(file);
      }
    });
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100/60 dark:hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats?.join(',') || 'image/*'}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {subtitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> JPG, PNG, WebP
          </span>
          <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Clipboard className="w-3.5 h-3.5 text-emerald-500" /> Paste Ctrl+V
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span className="text-slate-400">Don&apos;t have an image on hand?</span>
        <button
          type="button"
          onClick={handleLoadSample}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" /> Try Sample Image
        </button>
      </div>
    </div>
  );
};
