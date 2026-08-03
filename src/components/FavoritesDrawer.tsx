import React from 'react';
import { X, Star, Trash2, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { IMAGE_TOOLS } from '../data/toolsData';
import { ProcessedImageHistory } from '../types';
import { formatBytes } from '../utils/canvasUtils';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  recentHistory: ProcessedImageHistory[];
  onClearHistory: () => void;
  onSelectTool: (slug: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  recentHistory,
  onClearHistory,
  onSelectTool,
}) => {
  if (!isOpen) return null;

  const favTools = IMAGE_TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Favorites & History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Favorites */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Bookmarked Tools ({favTools.length})</span>
            </h4>
            {favTools.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No bookmarked tools. Click the star icon on any tool card to bookmark it.
              </p>
            ) : (
              <div className="space-y-2">
                {favTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50"
                  >
                    <button
                      onClick={() => {
                        onSelectTool(tool.slug);
                        onClose();
                      }}
                      className="flex-1 text-left hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm text-slate-900 dark:text-slate-100 truncate"
                    >
                      {tool.name}
                    </button>
                    <button
                      onClick={() => onToggleFavorite(tool.id)}
                      className="p-1 text-amber-500 hover:text-slate-400"
                      title="Remove bookmark"
                    >
                      <Star className="w-4 h-4 fill-amber-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Recent History */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Local Activity
              </h4>
              {recentHistory.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {recentHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No recent local processing activity. Process an image to see it listed here.
              </p>
            ) : (
              <div className="space-y-2">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                      <span className="truncate max-w-[200px]">{item.originalName}</span>
                      <span className="text-[10px] text-indigo-500 font-medium">{item.toolName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatBytes(item.originalSize)} → {formatBytes(item.processedSize)}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Stored locally in browser memory
        </div>
      </div>
    </div>
  );
};
