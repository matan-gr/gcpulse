import { useMemo } from 'react';
import { FeedItem } from '../types';

export const useArchitectureView = (items: FeedItem[]) => {
  const { featuredItems, standardItems } = useMemo(() => {
    return {
      featuredItems: items.slice(0, 4),
      standardItems: items.slice(4)
    };
  }, [items]);

  return {
    featuredItems,
    standardItems
  };
};
