import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import {
  loadImageFromFile,
  adjustImageQuality,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Sliders, RefreshCw, Download } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const QualityAdjusterTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [quality, setQuality] = useState<number>(0.75);
  const [format, setFormat] = useState<'jpeg' | 'webp'>('jpeg');

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      runQuality(img, quality, format, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to load image for quality adjustment.', 'error');
    }
  };

  const runQuality = async (
    img: HTMLImageElement,
    q: number,
    fmt: 'jpeg' | 'webp',
    origFile?: File
  ) => {
    try {
      const res = await adjustImageQuality(img, q, fmt);
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
      onShowToast('Error', 'Failed to adjust quality.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runQuality(imgElement, quality, format);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [quality, format]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-q${Math.round(quality * 100)}.${format === 'jpeg' ? 'jpg' : 'webp'}`);
    onShowToast('Download Started', `Saved with quality ${Math.round(quality * 100)}%`, 'success');
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
              <Sliders className="w-5 h-5 text-indigo-500" /> Quality Index Tuner
            </h3>
            <p className="text-xs text-slate-500">
              Original: <span className="font-semibold">{formatBytes(file.size)}</span>
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Quality Threshold Index</span>
              <span className="text-indigo-600">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
            >
              <option value="jpeg">JPG / JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
        </div>

        {result && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Tuned Output Size: {formatBytes(result.bytes)}
            </span>
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Tuned Image
            </button>
          </div>
        )}
      </div>

      {result && (
        <BeforeAfterSlider
          originalUrl={URL.createObjectURL(file)}
          processedUrl={result.dataUrl}
          originalLabel={`Original (${formatBytes(file.size)})`}
          processedLabel={`Tuned (${formatBytes(result.bytes)})`}
        />
      )}
    </div>
  );
};
