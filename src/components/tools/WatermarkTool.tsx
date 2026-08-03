import React, { useState, useEffect } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import {
  loadImageFromFile,
  addWatermarkToImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { Stamp, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const WatermarkTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState<string>('© ImageTools Pro Copyright');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textBgColor, setTextBgColor] = useState<string>('#000000');
  const [opacity, setOpacity] = useState<number>(0.7);
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled'>('bottom-right');
  const [angle, setAngle] = useState<number>(-25);

  const [watermarkLogoImg, setWatermarkLogoImg] = useState<HTMLImageElement | null>(null);

  const [result, setResult] = useState<{ dataUrl: string; bytes: number } | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      runWatermark(img, wmType, text, textColor, textBgColor, opacity, position, angle, watermarkLogoImg, selectedFile);
    } catch {
      onShowToast('Error', 'Failed to read photo for watermarking.', 'error');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const logo = await loadImageFromFile(e.target.files[0]);
        setWatermarkLogoImg(logo);
      } catch {
        onShowToast('Error', 'Failed to load watermark logo image.', 'error');
      }
    }
  };

  const runWatermark = async (
    img: HTMLImageElement,
    type: 'text' | 'image',
    txt: string,
    col: string,
    bgCol: string,
    op: number,
    pos: any,
    ang: number,
    logoImg: HTMLImageElement | null,
    origFile?: File
  ) => {
    try {
      const res = await addWatermarkToImage(
        img,
        {
          type,
          text: txt,
          textColor: col,
          textBgColor: bgCol,
          opacity: op,
          position: pos,
          angleDegrees: ang,
          watermarkImage: logoImg || undefined,
        },
        'png',
        0.95
      );
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
      onShowToast('Error', 'Failed to draw watermark on canvas.', 'error');
    }
  };

  useEffect(() => {
    if (imgElement && file) {
      const timer = setTimeout(() => {
        runWatermark(imgElement, wmType, text, textColor, textBgColor, opacity, position, angle, watermarkLogoImg);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [wmType, text, textColor, textBgColor, opacity, position, angle, watermarkLogoImg]);

  const handleDownload = () => {
    if (!result || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    downloadDataUrl(result.dataUrl, `${nameWithoutExt}-watermarked.png`);
    onShowToast('Download Started', 'Saved watermarked image', 'success');
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
              <Stamp className="w-5 h-5 text-indigo-500" /> Watermark Designer
            </h3>
            <p className="text-xs text-slate-500">
              Protect & Brand Graphic Assets
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Different
          </button>
        </div>

        {/* Watermark Type Selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setWmType('text')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              wmType === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Text Watermark
          </button>
          <button
            onClick={() => setWmType('image')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              wmType === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Image Logo Watermark
          </button>
        </div>

        {/* Watermark Controls */}
        {wmType === 'text' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload Custom Watermark Logo (PNG with Transparency)
            </label>
            <input
              type="file"
              accept="image/png,image/webp"
              onChange={handleLogoUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        )}

        {/* Position & Opacity Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="center">Center</option>
              <option value="tiled">Diagonal Tiled Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Opacity ({Math.round(opacity * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rotation Angle ({angle}°)
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              step="5"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
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
              <Download className="w-4 h-4" /> Download Protected Asset
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <img
            src={result.dataUrl}
            alt="Watermarked result"
            className="max-h-[450px] object-contain rounded-xl border border-slate-800 shadow-2xl"
          />
          <span className="text-xs font-semibold text-slate-400">
            Watermarked Preview ({formatBytes(result.bytes)})
          </span>
        </div>
      )}
    </div>
  );
};
