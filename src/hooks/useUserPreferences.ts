import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
      if (exists) {
        toast.success(`Unsubscribed from ${category}`);
        return {
          ...prev,
          subscribedCategories: prev.subscribedCategories.filter(c => c !== category)
        };
      } else {
        toast.success(`Subscribed to ${category}`);
        return {
          ...prev,
          subscribedCategories: [...prev.subscribedCategories, category]
        };
      }
    });
  };

  const toggleSavedPost = (link: string) => {
    setPrefs(prev => {
      const exists = prev.savedPosts.includes(link);
      if (exists) {
        toast.success("Removed from Read Later");
        return {
          ...prev,
          savedPosts: prev.savedPosts.filter(l => l !== link)
        };
      } else {
        toast.success("Added to Read Later");
        return {
          ...prev,
          savedPosts: [...prev.savedPosts, link]
        };
      }
    });
  };

  const clearSavedPosts = () => {
    setPrefs(prev => ({ ...prev, savedPosts: [] }));
    toast.success("Reading list cleared");
  };

  return {
    prefs,
    updatePrefs,
    toggleCategorySubscription,
    toggleSavedPost,
    clearSavedPosts
  };
}
