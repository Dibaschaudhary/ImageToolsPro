import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import {
  loadImageFromFile,
  loadImageFromDataUrl,
  flipImage,
  formatBytes,
  downloadDataUrl,
} from '../../utils/canvasUtils';
import {
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Download,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  Check,
  Maximize2,
  X,
  ArrowRight,
  Layers,
} from 'lucide-react';

export interface FlipToolProps {
  tool?: ImageTool;
  onAddHistory?: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  image?: File | string | HTMLImageElement | null;
  onUpdate?: (result: { dataUrl: string; file?: File; bytes: number; width: number; height: number }) => void;
  onChange?: (result: { dataUrl: string; file?: File; bytes: number; width: number; height: number }) => void;
  onReset?: () => void;
}

export const FlipTool: React.FC<FlipToolProps> = ({
  tool,
  onAddHistory,
  onShowToast,
  image,
  onUpdate,
  onChange,
  onReset,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string>('');

  const [flipH, setFlipH] = useState<boolean>(true);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.92);

  const [result, setResult] = useState<{ dataUrl: string; bytes: number; width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'preview'>('slider');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Helper toast proxy
  const notify = useCallback(
    (title: string, desc?: string, type?: 'success' | 'error' | 'info') => {
      if (onShowToast) {
        onShowToast(title, desc, type);
      }
    },
    [onShowToast]
  );

  // Initialize image if provided via props
  useEffect(() => {
    let isMounted = true;

    async function initFromProps() {
      if (!image) return;

      try {
        if (image instanceof File) {
          setFile(image);
          const img = await loadImageFromFile(image);
          if (isMounted) {
            setImgElement(img);
            setOriginalDataUrl(img.src);
          }
        } else if (typeof image === 'string') {
          const img = await loadImageFromDataUrl(image);
          if (isMounted) {
            setImgElement(img);
            setOriginalDataUrl(image);
            setFile(new File([], 'image.png', { type: 'image/png' }));
          }
        } else if (image instanceof HTMLImageElement) {
          if (isMounted) {
            setImgElement(image);
            setOriginalDataUrl(image.src);
            setFile(new File([], 'image.png', { type: 'image/png' }));
          }
        }
      } catch (err) {
        notify('Image Load Error', 'Failed to load source image for flipping.', 'error');
      }
    }

    initFromProps();

    return () => {
      isMounted = false;
    };
  }, [image, notify]);

  // Handle local dropzone upload
  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await loadImageFromFile(selectedFile);
      setImgElement(img);
      setOriginalDataUrl(img.src);
      notify('Image Loaded', `Loaded ${selectedFile.name} (${img.naturalWidth}×${img.naturalHeight}px)`, 'info');
    } catch {
      notify('Error', 'Failed to load image for flipping.', 'error');
    }
  };

  // Perform canvas transformation
  const runFlip = useCallback(async () => {
    if (!imgElement) return;

    setIsProcessing(true);
    try {
      const flippedRes = await flipImage(imgElement, flipH, flipV, format, quality);
      const output = {
        dataUrl: flippedRes.dataUrl,
        bytes: flippedRes.bytes,
        width: imgElement.naturalWidth,
        height: imgElement.naturalHeight,
      };

      setResult(output);

      // Trigger standard callbacks if attached
      if (onUpdate) onUpdate({ ...output, file: file || undefined });
      if (onChange) onChange({ ...output, file: file || undefined });

      // Record history
      if (onAddHistory && tool && file && file.name) {
        onAddHistory({
          toolId: tool.id,
          toolName: tool.name,
          originalName: file.name,
          originalSize: file.size,
          processedSize: output.bytes,
        });
      }
    } catch {
      notify('Flip Error', 'Failed to flip image canvas.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [imgElement, flipH, flipV, format, quality, file, onUpdate, onChange, onAddHistory, tool, notify]);

  // Re-run flip when orientation or output settings change
  useEffect(() => {
    if (imgElement) {
      runFlip();
    }
  }, [imgElement, flipH, flipV, format, quality, runFlip]);

  // Reset tool state
  const handleReset = () => {
    setFlipH(false);
    setFlipV(false);
    setFormat('png');
    setQuality(0.92);
    if (onReset) onReset();
    notify('Reset Completed', 'Reset flip controls to original orientation.', 'info');
  };

  // Upload different image
  const handleClear = () => {
    setFile(null);
    setImgElement(null);
    setResult(null);
    setOriginalDataUrl('');
    if (onReset) onReset();
  };

  // Download flipped image
  const handleDownload = () => {
    if (!result) return;
    const baseName = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) || file.name : 'image';
    const flipTag = flipH && flipV ? 'flipped-both' : flipH ? 'flipped-h' : flipV ? 'flipped-v' : 'flipped';
    downloadDataUrl(result.dataUrl, `${baseName}-${flipTag}.${format}`);
    notify('Download Started', `Saved mirrored image (${formatBytes(result.bytes)})`, 'success');
  };

  // Preset handlers
  const setPreset = (h: boolean, v: boolean) => {
    setFlipH(h);
    setFlipV(v);
  };

  if (!file && !imgElement) {
    return <Dropzone onFileSelected={handleFileSelected} acceptedFormats={tool?.acceptedFormats} />;
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Header Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FlipHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl flex items-center gap-2">
                Image Flip & Mirror
              </h3>
              {imgElement && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dimensions: <span className="font-semibold text-slate-700 dark:text-slate-300">{imgElement.naturalWidth} × {imgElement.naturalHeight} px</span>
                  {file && file.size > 0 && ` • Original Size: ${formatBytes(file.size)}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
              title="Reset flips"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
              title="Upload new image"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Image
            </button>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flip Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Mirror Axis
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                  flipH
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FlipHorizontal className="w-5 h-5" />
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      flipH ? 'bg-white text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">Horizontal Flip</div>
                  <div className={`text-[11px] ${flipH ? 'text-indigo-100' : 'text-slate-400'}`}>Left ↔ Right Mirror</div>
                </div>
              </button>

              <button
                onClick={() => setFlipV(!flipV)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                  flipV
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FlipVertical className="w-5 h-5" />
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      flipV ? 'bg-white text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">Vertical Flip</div>
                  <div className={`text-[11px] ${flipV ? 'text-indigo-100' : 'text-slate-400'}`}>Top ↕ Bottom Mirror</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPreset(true, false)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                  flipH && !flipV
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" /> Horizontal Only
              </button>

              <button
                onClick={() => setPreset(false, true)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                  !flipH && flipV
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" /> Vertical Only
              </button>

              <button
                onClick={() => setPreset(true, true)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                  flipH && flipV
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Both (180° Mirror)
              </button>

              <button
                onClick={() => setPreset(false, false)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                  !flipH && !flipV
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Original (No Flip)
              </button>
            </div>
          </div>
        </div>

        {/* Output Format Options */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Export Format
            </label>
            <div className="flex gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    format === fmt
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {format !== 'png' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Output Quality</span>
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
          )}
        </div>
      </div>

      {/* Interactive Preview Container */}
      {result && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* View Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Mode:</span>
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'slider'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Slider
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'side-by-side'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Result Only
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="View Fullsize"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Mirrored ({formatBytes(result.bytes)})</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas Area */}
          <div className="relative min-h-[300px] sm:min-h-[420px] flex items-center justify-center rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" /> Mirroring image canvas...
              </div>
            )}

            {viewMode === 'slider' && originalDataUrl && (
              <div className="w-full max-w-2xl mx-auto">
                <BeforeAfterSlider
                  originalUrl={originalDataUrl}
                  processedUrl={result.dataUrl}
                  originalLabel="Original"
                  processedLabel="Flipped"
                />
              </div>
            )}

            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 text-center">
                  <div className="text-xs font-bold text-slate-400">Original Image</div>
                  <img
                    src={originalDataUrl}
                    alt="Original"
                    className="max-h-[350px] mx-auto object-contain rounded-lg border border-slate-800"
                  />
                </div>
                <div className="space-y-2 text-center">
                  <div className="text-xs font-bold text-indigo-400">
                    Flipped Result ({flipH ? 'Horizontal ' : ''}{flipV ? 'Vertical' : ''})
                  </div>
                  <img
                    src={result.dataUrl}
                    alt="Flipped"
                    className="max-h-[350px] mx-auto object-contain rounded-lg border border-indigo-500/30"
                  />
                </div>
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="text-center space-y-2">
                <img
                  src={result.dataUrl}
                  alt="Flipped Result"
                  className="max-h-[420px] mx-auto object-contain rounded-lg border border-slate-800 shadow-2xl"
                />
                <div className="text-xs font-semibold text-slate-400">
                  {result.width} × {result.height} px • {formatBytes(result.bytes)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Inspection Modal */}
      {showModal && result && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-5xl max-h-[85vh] p-2 flex items-center justify-center">
            <img
              src={result.dataUrl}
              alt="Flipped Fullscreen"
              className="max-h-[80vh] max-w-full object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
