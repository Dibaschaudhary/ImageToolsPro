import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import {
  loadImageFromFile,
  cropImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Crop, RefreshCw, Download } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CropTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropW, setCropW] = useState<number>(400);
  const [cropH, setCropH] = useState<number>(400);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      const w = Math.round(img.naturalWidth * 0.8);
      const h = Math.round(img.naturalHeight * 0.8);
      const x = Math.round((img.naturalWidth - w) / 2);
      const y = Math.round((img.naturalHeight - h) / 2);
      setCropX(x);
      setCropY(y);
      setCropW(w);
      setCropH(h);
      runCrop(img, x, y, w, h, format, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to load photo for cropping.', 'error');
    }
  };

  const setPresetRatio = (ratioW: number, ratioH: number) => {
    if (!imgElement) return;
    const maxW = imgElement.naturalWidth;
    const maxH = imgElement.naturalHeight;

    let newW = maxW;
    let newH = Math.round((newW * ratioH) / ratioW);

    if (newH > maxH) {
      newH = maxH;
      newW = Math.round((newH * ratioW) / ratioH);
    }

    const newX = Math.round((maxW - newW) / 2);
    const newY = Math.round((maxH - newH) / 2);

    setCropX(newX);
    setCropY(newY);
    setCropW(newW);
    setCropH(newH);
  };

  const runCrop = async (
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    fmt: 'png' | 'jpeg' | 'webp',
    origFile?: File
  ) => {
    try {
      const res = await cropImage(img, x, y, w, h, fmt, 0.95);
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
      onShowToast('Crop failed', 'Failed to perform canvas crop.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runCrop(imgElement, cropX, cropY, cropW, cropH, format);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [cropX, cropY, cropW, cropH, format]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-cropped.${format}`);
    onShowToast('Download Started', 'Saved cropped image', 'success');
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
              <Crop className="w-5 h-5 text-indigo-500" /> Photo Cropper
            </h3>
            <p className="text-xs text-slate-500">
              Original: {imgElement.naturalWidth} × {imgElement.naturalHeight} px ({formatBytes(file.size)})
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Aspect Ratio Presets
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPresetRatio(1, 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white"
            >
              1:1 Square
            </button>
            <button
              onClick={() => setPresetRatio(16, 9)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white"
            >
              16:9 Landscape
            </button>
            <button
              onClick={() => setPresetRatio(9, 16)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white"
            >
              9:16 Vertical
            </button>
            <button
              onClick={() => setPresetRatio(4, 3)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white"
            >
              4:3 Classic
            </button>
          </div>
        </div>

        {/* Fine Pixel Adjustments */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Offset X (px)</label>
            <input
              type="number"
              value={cropX}
              onChange={(e) => setCropX(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Offset Y (px)</label>
            <input
              type="number"
              value={cropY}
              onChange={(e) => setCropY(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Crop Width (px)</label>
            <input
              type="number"
              value={cropW}
              onChange={(e) => setCropW(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Crop Height (px)</label>
            <input
              type="number"
              value={cropH}
              onChange={(e) => setCropH(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            />
          </div>
        </div>

        {/* Download Action */}
        <div className="flex justify-end pt-2">
          {result && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Cropped Image ({cropW} × {cropH} px)
            </button>
          )}
        </div>
      </div>

      {/* Result Cropped Preview */}
      {result && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <img
            src={result.dataUrl}
            alt="Cropped output"
            className="max-h-[450px] object-contain rounded-xl border border-slate-800 shadow-2xl"
          />
          <span className="text-xs font-semibold text-slate-400">
            Cropped Area: {cropW} × {cropH} px ({formatBytes(result.bytes)})
          </span>
        </div>
      )}
    </div>
  );
};
