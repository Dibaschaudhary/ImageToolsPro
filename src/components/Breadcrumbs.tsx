import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema } from '../utils/seoUtils';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  const schemaItems = [
    { name: 'Home', url: typeof window !== 'undefined' ? `${window.location.origin}/` : '/' },
    ...items.map((it) => ({
      name: it.label,
      url: typeof window !== 'undefined' ? `${window.location.origin}${it.path}` : it.path,
    })),
  ];

  const jsonLd = generateBreadcrumbSchema(schemaItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-2 overflow-x-auto">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {index === items.length - 1 ? (
              <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.path)}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};
