import React from 'react';
import { FeedItem } from '../types';
import { DeprecationTimeline } from '../components/DeprecationTimeline';
import { DeprecationLoader } from '../components/DeprecationLoader';

interface DeprecationsViewProps {
  items: FeedItem[];
  loading: boolean;
}

export const DeprecationsView: React.FC<DeprecationsViewProps> = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="col-span-full flex justify-center items-center min-h-[400px]">
        <DeprecationLoader />
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <DeprecationTimeline items={items} />
    </div>
  );
};
