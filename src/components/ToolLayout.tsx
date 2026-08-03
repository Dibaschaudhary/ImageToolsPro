import React, { useState } from 'react';
import { ImageTool, ProcessedImageHistory } from '../types';
import { Breadcrumbs } from './Breadcrumbs';
import { AdSpace } from './AdSpace';
import { Star, HelpCircle, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  generateSoftwareApplicationSchema,
  generateHowToSchema,
  generateFAQSchema,
} from '../utils/seoUtils';
import { IMAGE_TOOLS } from '../data/toolsData';

// Tools
import { CompressorTool } from './tools/CompressorTool';
import { ResizerTool } from './tools/ResizerTool';
import { CropTool } from './tools/CropTool';
import { RotateTool } from './tools/RotateTool';
import { FlipTool } from './tools/FlipTool';
import { FormatConverterTool } from './tools/FormatConverterTool';
import { QualityAdjusterTool } from './tools/QualityAdjusterTool';
import { WatermarkTool } from './tools/WatermarkTool';
import { BlurTool } from './tools/BlurTool';
import { ColorAdjusterTool } from './tools/ColorAdjusterTool';
import { ImageToBase64Tool } from './tools/ImageToBase64Tool';
import { Base64ToImageTool } from './tools/Base64ToImageTool';
import { ExtractDimensionsTool } from './tools/ExtractDimensionsTool';
import { DownloadOptimizedTool } from './tools/DownloadOptimizedTool';

interface ToolLayoutProps {
  tool: ImageTool;
  onNavigate: (path: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddHistory: (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  onNavigate,
  isFavorite,
  onToggleFavorite,
  onAddHistory,
  onShowToast,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const relatedTools = IMAGE_TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 4);

  // Render proper tool component
  const renderToolWorkspace = () => {
    switch (tool.id) {
      case 'image-compressor':
        return <CompressorTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'image-resizer':
        return <ResizerTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'crop-image':
        return <CropTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'rotate-image':
        return <RotateTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'flip-image':
        return <FlipTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'jpg-to-png':
      case 'png-to-jpg':
      case 'webp-to-png':
      case 'png-to-webp':
        return <FormatConverterTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'image-quality-adjuster':
        return <QualityAdjusterTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'add-watermark':
        return <WatermarkTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'blur-image':
        return <BlurTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'brightness-adjuster':
      case 'contrast-adjuster':
      case 'saturation-adjuster':
      case 'grayscale-converter':
        return <ColorAdjusterTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'image-to-base64':
        return <ImageToBase64Tool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'base64-to-image':
        return <Base64ToImageTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'extract-dimensions':
        return <ExtractDimensionsTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      case 'download-optimized':
        return <DownloadOptimizedTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
      default:
        return <CompressorTool tool={tool} onAddHistory={onAddHistory} onShowToast={onShowToast} />;
    }
  };

  const softwareSchema = generateSoftwareApplicationSchema(tool);
  const howToSchema = generateHowToSchema(tool);
  const faqSchema = generateFAQSchema(tool.faqs);

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Schema.org Structured Data Injectors */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Header & Breadcrumbs */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: tool.categoryName, path: `/category/${tool.category}` },
            { label: tool.name, path: `/tools/${tool.slug}` },
          ]}
          onNavigate={onNavigate}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                {tool.categoryName}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                100% Client-Side
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {tool.shortDescription}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(tool.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isFavorite
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isFavorite ? 'Bookmarked' : 'Bookmark Tool'}</span>
          </button>
        </div>
      </div>

      {/* Primary Interactive Workspace */}
      <section className="scroll-mt-20">
        {renderToolWorkspace()}
      </section>

      {/* AdSense Slot 1 */}
      <AdSpace type="banner" />

      {/* How to Use Guide */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> How to Use {tool.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tool.howToSteps.map((s) => (
            <div
              key={s.step}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 space-y-2 relative"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                {s.step}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {s.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Extensive 700+ Words Educational Guide */}
      <section className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
          {tool.guideTitle}
        </h2>
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
          {tool.detailedGuideText.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="text-lg font-bold text-slate-900 dark:text-white pt-4">
                  {paragraph.replace('## ', '')}
                </h3>
              );
            } else if (paragraph.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="text-base font-bold text-slate-900 dark:text-slate-100 pt-2">
                  {paragraph.replace('### ', '')}
                </h4>
              );
            } else {
              return <p key={pIdx}>{paragraph}</p>;
            }
          })}
        </div>
      </section>

      {/* AdSense Slot 2 */}
      <AdSpace type="in-article" />

      {/* FAQ Accordion Section */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {tool.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-700/50 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Tools Section */}
      {relatedTools.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" /> Related Image Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((rt) => (
              <button
                key={rt.id}
                onClick={() => onNavigate(`/tools/${rt.slug}`)}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-md text-left transition-all hover:-translate-y-0.5 group space-y-1"
              >
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {rt.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {rt.shortDescription}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
