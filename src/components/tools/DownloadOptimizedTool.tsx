import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import {
  loadImageFromFile,
  compressImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DownloadOptimizedTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [filename, setFilename] = useState<string>('optimized-image');
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [quality, setQuality] = useState<number>(0.82);

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setFilename(`${nameWithoutExt}-web-optimized`);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      runOptimization(img, quality, format, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to read file.', 'error');
    }
  };

  const runOptimization = async (
    img: HTMLImageElement,
    q: number,
    fmt: 'webp' | 'jpeg' | 'png',
    origFile?: File
  ) => {
    try {
      const res = await compressImage(img, q, undefined, undefined, fmt);
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
      onShowToast('Error', 'Failed to optimize asset.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      runOptimization(imgElement, quality, format);
    }
  }, [quality, format]);

  const handleDownload = () => {
    if (!result || !file) return;
    const cleanName = filename.trim().replaceAll(/[^a-zA-Z0-9_-]/g, '_') || 'optimized-asset';
    const ext = format === 'jpeg' ? 'jpg' : format;
    downloadDataUrl(result.dataUrl, `${cleanName}.${ext}`);
    onShowToast('Export Complete', `Saved web ready file as .${ext}`, 'success');
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
              <Download className="w-5 h-5 text-indigo-500" /> Web Ready Asset Exporter
            </h3>
            <p className="text-xs text-slate-500">
              Strip Metadata • Optimize Payload • Custom Filenames
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              SEO Friendly Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            >
              <option value="webp">WebP (Recommended for Web)</option>
              <option value="jpeg">JPG / JPEG (Universal Photo)</option>
              <option value="png">PNG (Lossless Vector/Graphics)</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Quality ({Math.round(quality * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Status Report */}
        {result && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Ready for Web Publishing
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Original: {formatBytes(file.size)} → Optimized: <span className="font-bold text-slate-900 dark:text-white">{formatBytes(result.bytes)}</span>
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Web Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
