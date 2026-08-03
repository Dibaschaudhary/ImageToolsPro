import React, { useState } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import {
  convertBase64ToImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import { FileCode, Download, RefreshCw } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const Base64ToImageTool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [base64Input, setBase64Input] = useState<string>('');
  const [decoded, setDecoded] = useState<{
    dimensions: string;
    bytes: number;
    dataUrl: string;
  } | null>(null);

  const handleDecode = async () => {
    if (!base64Input.trim()) {
      onShowToast('Empty Input', 'Please paste a valid Base64 string or Data URI.', 'error');
      return;
    }

    try {
      const res = await convertBase64ToImage(base64Input);
      setDecoded(res);
      onAddHistory({
        toolId: tool.id,
        toolName: tool.name,
        originalName: 'decoded-base64-image.png',
        originalSize: res.bytes,
        processedSize: res.bytes,
      });
      onShowToast('Successfully Decoded', `Parsed ${res.dimensions}`, 'success');
    } catch {
      onShowToast('Decode Error', 'Invalid or corrupted Base64 image data.', 'error');
    }
  };

  const handleDownload = (format: 'png' | 'jpg' | 'webp') => {
    if (!decoded) return;
    downloadDataUrl(decoded.dataUrl, `decoded-image.${format}`);
    onShowToast('Download Started', `Saved decoded image as .${format}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-500" /> Base64 to Image Decoder
            </h3>
            <p className="text-xs text-slate-500">
              Paste Base64 Data URI string to view & download photo
            </p>
          </div>
          {decoded && (
            <button
              onClick={() => {
                setBase64Input('');
                setDecoded(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Base64 String or Data URI
          </label>
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste your base64 string here (e.g. data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)"
            className="w-full h-36 p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleDecode}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          Decode Base64 Image
        </button>
      </div>

      {decoded && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <img
            src={decoded.dataUrl}
            alt="Decoded output"
            className="max-h-[450px] object-contain rounded-xl border border-slate-800 shadow-2xl"
          />
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">
              Dimensions: {decoded.dimensions} • Size: {formatBytes(decoded.bytes)}
            </span>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => handleDownload('png')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Save PNG
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Save JPG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
