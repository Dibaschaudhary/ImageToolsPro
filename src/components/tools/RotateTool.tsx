import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import {
  loadImageFromFile,
  rotateImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { RotateCw, RotateCcw, RefreshCw, Download } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const RotateTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [angle, setAngle] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

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
      runRotate(img, 0, bgColor, format, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to load image for rotation.', 'error');
    }
  };

  const runRotate = async (
    img: HTMLImageElement,
    ang: number,
    bg: string,
    fmt: 'png' | 'jpeg' | 'webp',
    origFile?: File
  ) => {
    try {
      const res = await rotateImage(img, ang, bg, fmt, 0.95);
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
      onShowToast('Rotate error', 'Failed to rotate image canvas.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runRotate(imgElement, angle, bgColor, format);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [angle, bgColor, format]);

  const handleRotateStep = (delta: number) => {
    setAngle((prev) => (prev + delta) % 360);
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-rotated-${angle}deg.${format}`);
    onShowToast('Download Started', `Saved rotated image (${angle}°)`, 'success');
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
              <RotateCw className="w-5 h-5 text-indigo-500" /> Rotate Controls
            </h3>
            <p className="text-xs text-slate-500">
              Current Angle: <span className="font-bold text-indigo-600">{angle}°</span>
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        {/* Rotation Preset Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleRotateStep(-90)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 90° Left
          </button>
          <button
            onClick={() => handleRotateStep(90)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCw className="w-4 h-4" /> 90° Right
          </button>
          <button
            onClick={() => setAngle(180)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition-colors"
          >
            180° Flip
          </button>
          <button
            onClick={() => setAngle(0)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white font-semibold text-xs transition-colors"
          >
            Reset (0°)
          </button>
        </div>

        {/* Fine Angle Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Fine Angle Adjustment</span>
            <span className="text-indigo-600">{angle}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Export */}
        <div className="flex justify-end pt-2">
          {result && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Rotated Image ({result.width} × {result.height} px)
            </button>
          )}
        </div>
      </div>

      {/* Preview Output */}
      {result && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <img
            src={result.dataUrl}
            alt="Rotated preview"
            className="max-h-[450px] object-contain rounded-xl border border-slate-800 shadow-2xl"
          />
          <span className="text-xs font-semibold text-slate-400">
            Dimensions: {result.width} × {result.height} px ({formatBytes(result.bytes)})
          </span>
        </div>
      )}
    </div>
  );
};
