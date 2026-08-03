import React, { useState } from 'react';
import { ImageTool, ProcessedImageHistory } from '../../types';
import { Dropzone } from '../Dropzone';
import { convertImageToBase64, formatBytes } from '../../utils/canvasUtils';
import { Code, Copy, Check, RefreshCw } from 'lucide-react';

interface ToolProps {
  tool: ImageTool;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImageToBase64Tool: React.FC<ToolProps> = ({ tool, onAddHistory, onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<{
    dataUrl: string;
    pureBase64: string;
    htmlSnippet: string;
    cssSnippet: string;
    fileSizeBytes: number;
    mimeType: string;
  } | null>(null);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const res = await convertImageToBase64(selectedFile);
      setBase64Data(res);
      onAddHistory({
        toolId: tool.id,
        toolName: tool.name,
        originalName: selectedFile.name,
        originalSize: selectedFile.size,
        processedSize: res.pureBase64.length,
      });
    } catch {
      onShowToast('Error', 'Failed to encode image to Base64.', 'error');
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    onShowToast('Copied to Clipboard!', `Copied ${type} string`, 'success');
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!file || !base64Data) {
    return <Dropzone onFileSelected={handleFileSelected} acceptedFormats={tool.acceptedFormats} />;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-500" /> Base64 Data URI Strings
            </h3>
            <p className="text-xs text-slate-500">
              {file.name} ({formatBytes(file.size)}) • {base64Data.mimeType}
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Convert Another
          </button>
        </div>

        {/* Output Code Snippets */}
        <div className="space-y-4">
          {/* Data URI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Data URI (For src=&quot;...&quot;)
              </span>
              <button
                onClick={() => handleCopy(base64Data.dataUrl, 'Data URI')}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                {copiedType === 'Data URI' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'Data URI' ? 'Copied' : 'Copy Data URI'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={base64Data.dataUrl}
              className="w-full h-24 p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 resize-none focus:outline-none"
            />
          </div>

          {/* HTML Tag Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                HTML &lt;img&gt; Tag
              </span>
              <button
                onClick={() => handleCopy(base64Data.htmlSnippet, 'HTML Tag')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                {copiedType === 'HTML Tag' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'HTML Tag' ? 'Copied' : 'Copy HTML'}</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={base64Data.htmlSnippet}
              className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 focus:outline-none"
            />
          </div>

          {/* CSS Background Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                CSS background-image Snippet
              </span>
              <button
                onClick={() => handleCopy(base64Data.cssSnippet, 'CSS Snippet')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                {copiedType === 'CSS Snippet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'CSS Snippet' ? 'Copied' : 'Copy CSS'}</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={base64Data.cssSnippet}
              className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
