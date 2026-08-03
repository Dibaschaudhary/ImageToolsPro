import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { IMAGE_TOOLS } from '../data/toolsData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTools = IMAGE_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Header */}
        <div className="relative flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 20+ image tools (compress, resize, crop, base64...)"
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No tools matching &quot;{query}&quot;
            </div>
          ) : (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.slug);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      {tool.categoryName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {tool.shortDescription}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 20 Private Client-side Tools
          </span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
