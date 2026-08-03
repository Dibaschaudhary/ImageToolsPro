import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Sun,
  Moon,
  Star,
  Download,
  Menu,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TOOL_CATEGORIES } from '../data/toolsData';

interface HeaderProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme?: () => void;
  toggleTheme?: () => void;
  favoriteCount?: number;
  favoritesCount?: number;
  onOpenSearch: () => void;
  onOpenFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath = '/',
  onNavigate,
  theme,
  onToggleTheme,
  toggleTheme,
  favoriteCount,
  favoritesCount,
  onOpenSearch,
  onOpenFavorites,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const handleToggleTheme = onToggleTheme || toggleTheme || (() => {});
  const favCount = favoriteCount ?? favoritesCount ?? 0;

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              onNavigate('/');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                ImageTools<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </span>
            </div>
          </button>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {TOOL_CATEGORIES.map((cat) => {
              const path = `/category/${cat.id}`;
              const active = currentPath === path;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate(path)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Search Bar Trigger */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full relative flex items-center text-left bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 rounded-full py-2 px-10 text-sm text-slate-400 dark:text-slate-400 border border-transparent transition-colors"
          >
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Search for a tool... (e.g. JPG to PNG)</span>
            <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Search tools"
          >
            <Search className="w-5 h-5 text-slate-500" />
          </button>

          {/* Favorites Star Drawer Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Favorite tools"
          >
            <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                {favCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* PWA Install App Button if available */}
          {deferredPrompt && (
            <button
              onClick={handleInstallPWA}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Categories
          </div>
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onNavigate(`/category/${cat.id}`);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {cat.name}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Client-Side Only
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Offline Capable
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
