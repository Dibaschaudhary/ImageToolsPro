import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('imagetools_favorites');
        return saved ? JSON.parse(saved) : ['image-compressor', 'image-resizer', 'crop-image'];
      } catch {
        return ['image-compressor', 'image-resizer', 'crop-image'];
      }
    }
    return ['image-compressor', 'image-resizer', 'crop-image'];
  });

  useEffect(() => {
    localStorage.setItem('imagetools_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return { favorites, toggleFavorite, isFavorite };
}
