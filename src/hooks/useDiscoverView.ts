import { useMemo } from 'react';
import { FeedItem } from '../types';
import { UserPreferences } from './useUserPreferences';

export const useDiscoverView = (items: FeedItem[], prefs: UserPreferences) => {
  const visibleColumns = useMemo(() => {
    const excludedSources = ['Deprecations', 'Service Health', 'Architecture Center', 'Security Bulletins', 'Open Source Blog'];
    return prefs.columnOrder
      .filter((source: string) => !excludedSources.includes(source) && !prefs.hiddenColumns?.includes(source));
  }, [prefs.columnOrder, prefs.hiddenColumns]);

  const getColumnItems = (source: string) => {
    return items.filter(i => i.source === source);
  };

  const handleScrollToFeed = () => {
    const feedElement = document.getElementById('feed-grid');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    visibleColumns,
    getColumnItems,
    handleScrollToFeed
  };
};
