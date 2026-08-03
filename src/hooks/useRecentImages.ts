import { useState, useEffect } from 'react';
import { ProcessedImageHistory } from '../types';

export function useRecentImages() {
  const [recentHistory, setRecentHistory] = useState<ProcessedImageHistory[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('imagetools_recent_history');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('imagetools_recent_history', JSON.stringify(recentHistory.slice(0, 15)));
    } catch (e) {
      // Storage quota exceeded fallback
      console.warn('LocalStorage limit reached for history thumbnail cache.');
    }
  }, [recentHistory]);

  const addHistoryItem = (item: Omit<ProcessedImageHistory, 'id' | 'timestamp'>) => {
    const newItem: ProcessedImageHistory = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    setRecentHistory((prev) => [newItem, ...prev.filter((p) => p.originalName !== item.originalName)].slice(0, 15));
  };

  const clearHistory = () => {
    setRecentHistory([]);
    localStorage.removeItem('imagetools_recent_history');
  };

  return { recentHistory, addHistoryItem, clearHistory };
}
