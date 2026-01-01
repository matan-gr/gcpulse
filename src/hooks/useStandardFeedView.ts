import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedItem } from '../types';

export const useStandardFeedView = (items: FeedItem[]) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0, rootMargin: '200px' });

  useEffect(() => {
    if (inView) {
      setVisibleCount(prev => prev + 12);
    }
  }, [inView]);

  // Reset visible count when items change (e.g. filtering)
  useEffect(() => {
    setVisibleCount(12);
  }, [items]);

  const hasMore = items.length > visibleCount;
  const visibleItems = items.slice(0, visibleCount);

  return {
    visibleItems,
    loadMoreRef,
    hasMore
  };
};
