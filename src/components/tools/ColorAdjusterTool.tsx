import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import {
  loadImageFromFile,
  adjustImageFilters,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Sun, Contrast, Palette, Moon, RefreshCw, Download, RotateCcw } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ColorAdjusterTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Filter sliders
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(
    tool.id === 'grayscale-converter' ? 100 : 0
  );
  const [sepia, setSepia] = useState<number>(0);

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  useEffect(() => {
    if (tool.id === 'grayscale-converter') setGrayscale(100);
    else if (tool.id === 'brightness-adjuster') setBrightness(25);
    else if (tool.id === 'contrast-adjuster') setContrast(30);
    else if (tool.id === 'saturation-adjuster') setSaturation(40);
  }, [tool]);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      runAdjust(img, brightness, contrast, saturation, grayscale, sepia, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to load photo for color adjustment.', 'error');
    }
  };

  const runAdjust = async (
    img: HTMLImageElement,
    b: number,
    c: number,
    s: number,
    g: number,
    sep: number,
    origFile?: File
  ) => {
    try {
      const res = await adjustImageFilters(img, {
        brightness: b,
        contrast: c,
        saturation: s,
        grayscale: g,
        sepia: sep,
      });
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
      onShowToast('Error', 'Failed to apply filter adjustments.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runAdjust(imgElement, brightness, contrast, saturation, grayscale, sepia);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [brightness, contrast, saturation, grayscale, sepia]);

  const handleResetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setGrayscale(0);
    setSepia(0);
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-edited.png`);
    onShowToast('Download Started', 'Saved color adjusted photo', 'success');
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
              <Sun className="w-5 h-5 text-amber-500" /> Color Channel Lab
            </h3>
            <p className="text-xs text-slate-500">
              Fine-tune luminance, dynamic range, and chroma saturation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => setFile(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change Photo
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Brightness */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-500" /> Brightness</span>
              <span className="text-indigo-600 font-bold">{brightness > 0 ? `+${brightness}` : brightness}%</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5 text-indigo-500" /> Contrast</span>
              <span className="text-indigo-600 font-bold">{contrast > 0 ? `+${contrast}` : contrast}%</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5 text-rose-500" /> Saturation</span>
              <span className="text-indigo-600 font-bold">{saturation > 0 ? `+${saturation}` : saturation}%</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Grayscale */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-slate-400" /> Grayscale</span>
              <span className="text-indigo-600 font-bold">{grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={grayscale}
              onChange={(e) => setGrayscale(parseInt(e.target.value))}
              className="w-full accent-slate-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Download */}
        <div className="flex justify-end pt-2">
          {result && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Color Adjusted Photo
            </button>
          )}
        </div>
      </div>

      {result && (
        <BeforeAfterSlider
          originalUrl={URL.createObjectURL(file)}
          processedUrl={result.dataUrl}
          originalLabel="Original Photo"
          processedLabel="Adjusted Result"
        />
      )}
    </div>
  );
};
