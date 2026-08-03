import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import {
  loadImageFromFile,
  compressImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Download, RefreshCw, Sliders, ArrowRight, ShieldCheck } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CompressorTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');

  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<{
    dataUrl: string;
    bytes: number;
    width: number;
    height: number;
  } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      setTargetWidth(img.naturalWidth);
      runCompression(img, quality, img.naturalWidth, format, selectedFile);
    } catch (err) {
      onShowToast('Error loading image', 'Failed to decode image file.', 'error');
    }
  };

  const runCompression = async (
    img: HTMLImageElement,
    q: number,
    w: number,
    fmt: 'jpeg' | 'png' | 'webp',
    origFile?: File
  ) => {
    setProcessing(true);
    try {
      const res = await compressImage(img, q, w, undefined, fmt);
      setResult(res);
      const fileToUse = origFile || file;
      if (fileToUse) {
        onAddHistory({
          toolId: tool.id,
          toolName: tool.name,
          originalName: fileToUse.name,
          originalSize: fileToUse.size,
          processedSize: res.bytes,
        });
      }
    } catch (e) {
      onShowToast('Compression failed', 'An error occurred during canvas compression.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runCompression(imgElement, quality, targetWidth, format);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [quality, targetWidth, format]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = format === 'jpeg' ? 'jpg' : format;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-compressed.${ext}`);
    onShowToast('Download Started', `Saved compressed image as .${ext}`, 'success');
  };

  const handleReset = () => {
    setFile(null);
    setImgElement(null);
    setResult(null);
  };

  if (!file || !imgElement) {
    return <Dropzone onFileSelected={handleFileSelected} acceptedFormats={tool.acceptedFormats} />;
  }

  const compressionRatio = file.size > 0 && result
    ? Math.round(((file.size - result.bytes) / file.size) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Interactive Controls Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" /> Compressor Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</span> ({imgElement.naturalWidth} × {imgElement.naturalHeight} px)
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Compression Quality</span>
              <span className="text-indigo-600 dark:text-indigo-400">{Math.round(quality * 100)}%</span>
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
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Max Compression (Small Size)</span>
              <span>High Quality</span>
            </div>
          </div>

          {/* Max Width Scaler */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Width (px)
            </label>
            <input
              type="number"
              value={targetWidth}
              onChange={(e) => setTargetWidth(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Output Format Select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="jpeg">JPG / JPEG (Best for Photos)</option>
              <option value="webp">WebP (Next-Gen Web Format)</option>
              <option value="png">PNG (Lossless / Transparent)</option>
            </select>
          </div>
        </div>

        {/* Compression Size Savings Card */}
        {result && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Compressed Size</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatBytes(result.bytes)}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Savings</span>
                <span className={`text-base font-bold ${compressionRatio > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {compressionRatio > 0 ? `-${compressionRatio}% reduced` : 'Original Size'}
                </span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={processing}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Compressed Image
            </button>
          </div>
        )}
      </div>

      {/* Visual Split Comparison */}
      {result && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Visual Quality Comparison (Drag slider to inspect)
          </h4>
          <BeforeAfterSlider
            originalUrl={URL.createObjectURL(file)}
            processedUrl={result.dataUrl}
            originalLabel={`Original (${formatBytes(file.size)})`}
            processedLabel={`Compressed (${formatBytes(result.bytes)})`}
          />
        </div>
      )}
    </div>
  );
};
