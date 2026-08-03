import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'info',
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl max-w-sm w-full animate-in fade-in slide-in-from-bottom-5">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-white">{title}</h4>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
