import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import {
  loadImageFromFile,
  resizeImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Scaling, RefreshCw, Download, Lock, Unlock } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResizerTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      runResize(img, img.naturalWidth, img.naturalHeight, format, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to read image dimensions.', 'error');
    }
  };

  const handleWidthChange = (val: number) => {
    const newW = Math.max(1, val);
    setWidth(newW);
    if (lockAspect && aspectRatio) {
      setHeight(Math.round(newW / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    const newH = Math.max(1, val);
    setHeight(newH);
    if (lockAspect && aspectRatio) {
      setWidth(Math.round(newH * aspectRatio));
    }
  };

  const applyPercentScale = (percent: number) => {
    if (!imgElement) return;
    const newW = Math.round((imgElement.naturalWidth * percent) / 100);
    const newH = Math.round((imgElement.naturalHeight * percent) / 100);
    setWidth(newW);
    setHeight(newH);
  };

  const runResize = async (
    img: HTMLImageElement,
    w: number,
    h: number,
    fmt: 'png' | 'jpeg' | 'webp',
    origFile?: File
  ) => {
    try {
      const res = await resizeImage(img, w, h, fmt, 0.95);
      setResult(res);
      const f = origFile || file;
      if (f) {
        onAddHistory({
          toolId: tool.id,
          toolName: tool.name,
          originalName: f.name,
          originalSize: f.size,
          processedSize: res.bytes,
        });
      }
    } catch {
      onShowToast('Resize error', 'Failed to resize canvas.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runResize(imgElement, width, height, format);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [width, height, format]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-${width}x${height}.${format}`);
    onShowToast('Download Started', 'Saved resized image', 'success');
  };

  if (!file || !imgElement) {
    return <Dropzone onFileSelected={handleFileSelected} acceptedFormats={tool.acceptedFormats} />;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Scaling className="w-5 h-5 text-indigo-500" /> Dimension Resizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original: <span className="font-semibold">{imgElement.naturalWidth} × {imgElement.naturalHeight} px</span> ({formatBytes(file.size)})
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        {/* Preset Percentage Scaling */}
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Quick Percentage Scaling
          </span>
          <div className="flex flex-wrap gap-2">
            {[25, 50, 75, 100, 150, 200].map((pct) => (
              <button
                key={pct}
                onClick={() => applyPercentScale(pct)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Width & Height Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-center pt-5">
            <button
              onClick={() => setLockAspect(!lockAspect)}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                lockAspect
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
              }`}
            >
              {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{lockAspect ? 'Aspect Ratio Locked' : 'Unlocked'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Output Format */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format:</label>
            <div className="flex gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                    format === fmt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Resized Image
            </button>
          )}
        </div>
      </div>

      {/* Preview Canvas */}
      {result && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <img
            src={result.dataUrl}
            alt="Resized preview"
            style={{ width: `${Math.min(600, width)}px` }}
            className="max-h-[500px] object-contain rounded-lg border border-slate-800"
          />
          <span className="text-xs text-slate-400 font-semibold">
            Output: {width} × {height} px ({formatBytes(result.bytes)})
          </span>
        </div>
      )}
    </div>
  );
};
