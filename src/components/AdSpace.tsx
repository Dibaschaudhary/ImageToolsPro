import React from 'react';

interface AdSpaceProps {
  type?: 'banner' | 'rectangle' | 'in-article';
  className?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ type = 'banner', className = '' }) => {
  return (
    <div className={`my-6 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center ${className}`}>
      {/* Google AdSense Banner Placeholder */}
      <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
        Advertisement
      </div>
      <div className="w-full h-16 sm:h-20 max-w-2xl bg-slate-200/50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        Responsive Ad Unit Space
      </div>
    </div>
  );
};
