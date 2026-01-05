import React from 'react';
import { FeedItem } from '../types';
import { DeprecationTimeline } from '../components/DeprecationTimeline';
import { DeprecationLoader } from '../components/DeprecationLoader';
import { PageHeader } from '../components/ui/PageHeader';
import { CalendarClock } from 'lucide-react';

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

  // Calculate stats
  const total = items.length;
  const critical = items.filter(i => {
    const match = i.contentSnippet?.match(/(\d{4}-\d{2}-\d{2})/);
    if (!match) return false;
    const days = (new Date(match[0]).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 90;
  }).length;

  return (
    <div className="col-span-full max-w-7xl mx-auto">
      <PageHeader
        title="Deprecation Roadmap"
        description="Track upcoming end-of-life (EOL) dates and service deprecations. Plan your migrations effectively to avoid service disruptions."
        badge="Lifecycle Management"
        icon={CalendarClock}
        gradient="from-amber-600 to-orange-600"
        stats={[
          { label: 'Active Notices', value: total },
          { label: 'Critical (<90 Days)', value: critical },
          { label: 'Action Required', value: critical > 0 ? 'Yes' : 'No' }
        ]}
      />
      <DeprecationTimeline items={items} />
    </div>
  );
};
