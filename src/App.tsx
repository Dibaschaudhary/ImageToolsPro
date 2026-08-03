import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { Toast } from './components/Toast';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { PolicyPage } from './pages/PolicyPage';
import { ToolLayout } from './components/ToolLayout';

import { useTheme } from './hooks/useTheme';
import { useFavorites } from './hooks/useFavorites';
import { useRecentImages } from './hooks/useRecentImages';
import { IMAGE_TOOLS } from './data/toolsData';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentHistory, addHistoryItem, clearHistory } = useRecentImages();

  // Navigation State (Simulated Client Router for Vite / SPA preview with URL hash sync)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash.replace('#', '') || '/';
  });

  // UI Drawer & Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    desc?: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    title: '',
    type: 'info',
  });

  const showToast = (
    title: string,
    desc?: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setToast({ show: true, title, desc, type });
  };

  // Sync Hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/';
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Router Parser
  const renderCurrentView = () => {
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (currentPath.startsWith('/tools/')) {
      const slug = currentPath.replace('/tools/', '');
      const tool = IMAGE_TOOLS.find((t) => t.slug === slug || t.id === slug);
      if (tool) {
        return (
          <ToolLayout
            tool={tool}
            onNavigate={handleNavigate}
            isFavorite={isFavorite(tool.id)}
            onToggleFavorite={toggleFavorite}
            onAddHistory={addHistoryItem}
            onShowToast={showToast}
          />
        );
      }
    }

    if (currentPath.startsWith('/category/')) {
      const catSlug = currentPath.replace('/category/', '');
      return (
        <CategoryPage
          categorySlug={catSlug}
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    const policyRoutes = [
      '/about',
      '/contact',
      '/privacy',
      '/privacy-policy',
      '/terms',
      '/terms-and-conditions',
      '/terms-of-service',
      '/disclaimer',
      '/cookie-policy',
      '/dmca-policy',
      '/editorial-policy',
    ];

    if (policyRoutes.includes(currentPath)) {
      const pageSlug = currentPath.replace('/', '');
      return (
        <PolicyPage
          pageSlug={pageSlug}
          onNavigate={handleNavigate}
          onShowToast={showToast}
        />
      );
    }

    // Default Fallback
    return (
      <HomePage
        onNavigate={handleNavigate}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <Header
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoriteCount={favorites.length}
      />

      {/* Main Page Area */}
      <main className="flex-1 pb-16">{renderCurrentView()}</main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={(slug) => handleNavigate(`/tools/${slug}`)}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        recentHistory={recentHistory}
        onSelectTool={(slug) => handleNavigate(`/tools/${slug}`)}
        onToggleFavorite={toggleFavorite}
        onClearHistory={clearHistory}
      />

      {/* Global Toast */}
      {toast.show && (
        <Toast
          title={toast.title}
          description={toast.desc}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}

export default App;
