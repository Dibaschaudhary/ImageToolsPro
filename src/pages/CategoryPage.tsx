import React from 'react';
import { TOOL_CATEGORIES, IMAGE_TOOLS } from '../data/toolsData';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AdSpace } from '../components/AdSpace';
import { Layers, ArrowRight, Star } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (path: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const category = TOOL_CATEGORIES.find((c) => c.id === categorySlug);
  const toolsInCategory = IMAGE_TOOLS.filter(
    (t) => t.category === categorySlug || t.category === category?.id
  );

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Not Found</h1>
        <p className="text-slate-500">The requested tool category does not exist.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <Breadcrumbs
        items={[{ label: category.name, path: `/category/${category.id}` }]}
        onNavigate={onNavigate}
      />

      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          <Layers className="w-4 h-4" /> Category Directory
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {category.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {category.description}
        </p>
      </div>

      <AdSpace type="banner" />

      {/* Tools Grid in Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsInCategory.map((tool) => {
          const isFav = favorites.includes(tool.id);
          return (
            <div
              key={tool.id}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-lg hover:shadow-2xl hover:border-indigo-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-500/10 uppercase">
                    100% Client-Side
                  </span>
                  <button
                    onClick={() => onToggleFavorite(tool.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => onNavigate(`/tools/${tool.slug}`)}
                  className="text-left w-full space-y-2"
                >
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </button>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => onNavigate(`/tools/${tool.slug}`)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  Launch Tool <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
