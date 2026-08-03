import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import {
  loadImageFromFile,
  convertImageFormat,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { FileImage, RefreshCw, Download, ArrowRight } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormatConverterTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>(
    tool.defaultOutputFormat || 'png'
  );
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [quality, setQuality] = useState<number>(0.92);

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  useEffect(() => {
    setTargetFormat(tool.defaultOutputFormat || 'png');
  }, [tool]);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      runConversion(img, targetFormat, bgColor, quality, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to read image for format conversion.', 'error');
    }
  };

  const runConversion = async (
    img: HTMLImageElement,
    fmt: 'png' | 'jpeg' | 'webp',
    bg: string,
    q: number,
    origFile?: File
  ) => {
    try {
      const res = await convertImageFormat(img, fmt, bg, q);
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
      onShowToast('Conversion Error', 'Failed to convert format on canvas.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      runConversion(imgElement, targetFormat, bgColor, quality);
    }
  }, [targetFormat, bgColor, quality]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}.${ext}`);
    onShowToast('Download Started', `Saved as .${ext}`, 'success');
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
              <FileImage className="w-5 h-5 text-indigo-500" /> Format Conversion Settings
            </h3>
            <p className="text-xs text-slate-500">
              Input: <span className="font-semibold text-slate-700 dark:text-slate-300">{file.name}</span> ({formatBytes(file.size)})
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Target Format */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Output Format
            </label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="png">PNG (Lossless / Supports Transparency)</option>
              <option value="jpeg">JPG / JPEG (Standard Compressed Photo)</option>
              <option value="webp">WebP (Next-Gen High Performance)</option>
            </select>
          </div>

          {/* Background Fill for JPG */}
          {targetFormat === 'jpeg' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Background Fill Color (For transparent areas)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {bgColor}
                </span>
              </div>
            </div>
          )}

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Encoding Quality</span>
              <span>{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Bar */}
        {result && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span>Original: {formatBytes(file.size)}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                Converted: {formatBytes(result.bytes)}
              </span>
            </div>

            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Converted .{targetFormat === 'jpeg' ? 'jpg' : targetFormat}
            </button>
          </div>
        )}
      </div>

      {/* Result Preview */}
      {result && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <img
            src={result.dataUrl}
            alt="Converted result"
            className="max-h-[450px] object-contain rounded-xl border border-slate-800 shadow-2xl"
          />
          <span className="text-xs font-semibold text-slate-400">
            Formatted Preview ({formatBytes(result.bytes)})
          </span>
        </div>
      )}
    </div>
  );
};
