import React from 'react';
import { Sparkles, Shield, Lock, Zap, Heart } from 'lucide-react';
import { IMAGE_TOOLS, TOOL_CATEGORIES } from '../data/toolsData';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const popularTools = IMAGE_TOOLS.filter((t) => t.popular).slice(0, 6);

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400">
      {/* Privacy Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-indigo-500/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
            <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>100% Client-Side Processing. No files are ever uploaded or stored on cloud servers.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Local GPU</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Private Sandbox</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ImageTools Pro
            </span>
          </button>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Free, fast, and completely private browser-based image utilities. Compress, resize, convert, crop, and adjust graphics directly inside your web browser.
          </p>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} ImageTools Pro. All rights reserved.
          </div>
        </div>

        {/* Col 2: Top Popular Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            Popular Tools
          </h4>
          <ul className="space-y-2 text-xs">
            {popularTools.map((tool) => (
              <li key={tool.id}>
                <button
                  onClick={() => onNavigate(`/tools/${tool.slug}`)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {tool.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            Categories
          </h4>
          <ul className="space-y-2 text-xs">
            {TOOL_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onNavigate(`/category/${cat.id}`)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Legal & Policies */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            Policies & Legal
          </h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('/about')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</button></li>
            <li><button onClick={() => onNavigate('/contact')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Us</button></li>
            <li><button onClick={() => onNavigate('/privacy-policy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => onNavigate('/terms-and-conditions')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms & Conditions</button></li>
            <li><button onClick={() => onNavigate('/disclaimer')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Disclaimer</button></li>
            <li><button onClick={() => onNavigate('/cookie-policy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookie Policy</button></li>
            <li><button onClick={() => onNavigate('/dmca-policy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">DMCA Policy</button></li>
            <li><button onClick={() => onNavigate('/editorial-policy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Editorial Policy</button></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
