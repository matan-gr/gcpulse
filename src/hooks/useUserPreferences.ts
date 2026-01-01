import { useState, useEffect } from 'react';

export interface UserPreferences {
  viewMode: 'grid' | 'list';
  subscribedCategories: string[];
  savedPosts: string[]; // Array of link IDs
  filterCategory: string | null;
  filterDateRange: { start: string; end: string } | null;
  columnOrder: string[];
  hiddenColumns: string[];
}

const DEFAULT_PREFS: UserPreferences = {
  viewMode: 'grid',
  subscribedCategories: [],
  savedPosts: [],
  filterCategory: null,
  filterDateRange: null,
  columnOrder: ['Cloud Blog', 'Product Updates', 'Release Notes'],
  hiddenColumns: []
};

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('user_prefs');
    if (saved) {
      return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
    }
    
    return DEFAULT_PREFS;
  });

  useEffect(() => {
    localStorage.setItem('user_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const updatePrefs = (newPrefs: Partial<UserPreferences>) => {
    setPrefs(prev => ({ ...prev, ...newPrefs }));
  };

  const toggleCategorySubscription = (category: string) => {
    setPrefs(prev => {
      const exists = prev.subscribedCategories.includes(category);
      return {
        ...prev,
        subscribedCategories: exists
          ? prev.subscribedCategories.filter(c => c !== category)
          : [...prev.subscribedCategories, category]
      };
    });
  };

  const toggleSavedPost = (link: string) => {
    setPrefs(prev => {
      const exists = prev.savedPosts.includes(link);
      return {
        ...prev,
        savedPosts: exists
          ? prev.savedPosts.filter(l => l !== link)
          : [...prev.savedPosts, link]
      };
    });
  };

  const clearSavedPosts = () => {
    setPrefs(prev => ({ ...prev, savedPosts: [] }));
  };

  return {
    prefs,
    updatePrefs,
    toggleCategorySubscription,
    toggleSavedPost,
    clearSavedPosts
  };
}
