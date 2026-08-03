import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import {
  loadImageFromFile,
  blurImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { EyeOff, RefreshCw, Download } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const BlurTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [blurRadius, setBlurRadius] = useState<number>(10);
  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      runBlur(img, blurRadius, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to load photo for blurring.', 'error');
    }
  };

  const runBlur = async (img: HTMLImageElement, radius: number, origFile?: File) => {
    try {
      const res = await blurImage(img, radius, 'png', 0.95);
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
      onShowToast('Error', 'Failed to blur image canvas.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runBlur(imgElement, blurRadius);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [blurRadius]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-blurred.png`);
    onShowToast('Download Started', 'Saved blurred image', 'success');
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
              <EyeOff className="w-5 h-5 text-indigo-500" /> Gaussian Blur Control
            </h3>
            <p className="text-xs text-slate-500">
              Soft Focus & Censorship Privacy Filter
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Blur Radius Intensity</span>
            <span className="text-indigo-600 font-bold">{blurRadius} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={blurRadius}
            onChange={(e) => setBlurRadius(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div className="flex justify-end pt-2">
          {result && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Blurred Image
            </button>
          )}
        </div>
      </div>

      {result && (
        <BeforeAfterSlider
          originalUrl={URL.createObjectURL(file)}
          processedUrl={result.dataUrl}
          originalLabel="Sharp Original"
          processedLabel={`Blurred (${blurRadius}px)`}
        />
      )}
    </div>
  );
};
