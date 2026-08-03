import React, { useState } from 'react';
import { ImageTool, ProcessedImageHistory, ImageDimensionsInfo } from '../../types';
import { Dropzone } from '../Dropzone';
import { extractImageDetails } from '../../utils/canvasUtils';
import { Ruler, RefreshCw, Copy, Check, Palette } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExtractDimensionsTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState<ImageDimensionsInfo | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const res = await extractImageDetails(selectedFile);
      setDetails(res);
      onAddHistory({
        toolId: tool.id,
        toolName: tool.name,
        originalName: selectedFile.name,
        originalSize: selectedFile.size,
        processedSize: selectedFile.size,
      });
    } catch {
      onShowToast('Error', 'Failed to inspect image details.', 'error');
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onShowToast('Copied Color Code', `Copied ${hex} to clipboard`, 'success');
    setTimeout(() => setCopiedHex(null), 2000);
  };

  if (!file || !details) {
    return <Dropzone onFileSelected={handleFileSelected} acceptedFormats={tool.acceptedFormats} />;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Ruler className="w-5 h-5 text-indigo-500" /> Image Inspector Report
            </h3>
            <p className="text-xs text-slate-500">{details.fileName}</p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Inspect Another
          </button>
        </div>

        {/* Dimension Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Width</span>
            <span className="block text-xl font-extrabold text-slate-900 dark:text-white">
              {details.width} px
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Height</span>
            <span className="block text-xl font-extrabold text-slate-900 dark:text-white">
              {details.height} px
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Aspect Ratio</span>
            <span className="block text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {details.aspectRatio}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase">File Weight</span>
            <span className="block text-xl font-extrabold text-emerald-500">
              {details.fileSizeFormatted}
            </span>
          </div>
        </div>

        {/* Secondary Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 block text-[10px]">Megapixels:</span>
            <span className="font-bold">{details.megaPixels}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 block text-[10px]">MIME Type:</span>
            <span className="font-bold">{details.mimeType}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 block text-[10px]">Color Depth:</span>
            <span className="font-bold">{details.colorDepth}</span>
          </div>
        </div>

        {/* Extracted Dominant Palette */}
        {details.dominantColors.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" /> Extracted Dominant Palette
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {details.dominantColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyHex(color.hex)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:scale-105 transition-transform text-left group"
                >
                  <div
                    className="w-full h-10 rounded-lg mb-2 shadow-inner border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    <span>{color.hex}</span>
                    {copiedHex === color.hex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
