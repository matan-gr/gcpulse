import { useMemo } from 'react';
import { FeedItem } from '../types';
import { extractGCPProducts } from '../utils';

export const useDashboardStats = (items: FeedItem[]) => {
  
  // 1. Calculate Stats (Official Data Only)
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const recentItems = items.filter(i => new Date(i.isoDate) >= thirtyDaysAgo);
    
    const totalUpdates = recentItems.length;
    
    // Active Incidents Logic (Robust)
    const activeIncidents = items.filter(i => 
      i.source === 'Service Health' && i.isActive
    ).length;

    const securityBulletins = recentItems.filter(i => i.source === 'Security Bulletins').length;
    const deprecations = recentItems.filter(i => i.source === 'Deprecations').length;
    const productUpdates = recentItems.filter(i => i.source === 'Product Updates' || i.source === 'Release Notes').length;

    const innovationScore = totalUpdates > 0 ? Math.round((productUpdates / totalUpdates) * 100) : 0;
    
    // Service Health Status
    const healthStatus = activeIncidents === 0 ? 'Optimal' : activeIncidents < 3 ? 'Degraded' : 'Critical';

    return { totalUpdates, activeIncidents, securityBulletins, deprecations, innovationScore, healthStatus };
  }, [items]);

  // 2. Security Severity Trends (Stacked Bar)
  const securityTrendData = useMemo(() => {
    const last6Months = new Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(1); // Set to 1st of month to avoid overflow issues (e.g. Mar 31 -> Feb 28/29)
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('default', { month: 'short' });
    });

    return last6Months.map(month => {
      const monthItems = items.filter(i => 
        i.source === 'Security Bulletins' && 
        new Date(i.isoDate).toLocaleString('default', { month: 'short' }) === month
      );

      const counts = { month, Critical: 0, High: 0, Medium: 0, Low: 0 };
      monthItems.forEach(item => {
        const text = (item.title + " " + item.contentSnippet).toLowerCase();
        if (text.includes('critical')) counts.Critical++;
        else if (text.includes('high')) counts.High++;
        else if (text.includes('medium')) counts.Medium++;
        else counts.Low++;
      });
      return counts;
    });
  }, [items]);

  // 2.1 Top Impacted Products (Security)
  const securityImpactData = useMemo(() => {
    const secItems = items.filter(i => i.source === 'Security Bulletins');
    const counts: Record<string, number> = {};
    
    secItems.forEach(item => {
      const products = extractGCPProducts(item.title + " " + item.contentSnippet);
      if (products.length > 0) {
        products.forEach(p => counts[p] = (counts[p] || 0) + 1);
      } else {
        counts['General'] = (counts['General'] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [items]);

  // 2.2 Deprecation Timeline Stats
  const deprecationTimelineStats = useMemo(() => {
    const depItems = items.filter(i => i.source === 'Deprecations');
    const now = new Date();
    const stats = { next30: 0, next60: 0, next90: 0, total: depItems.length };

    depItems.forEach(item => {
      const futureDateMatch = item.contentSnippet?.match(/(\d{4}-\d{2}-\d{2})/);
      if (futureDateMatch) {
        const eolDate = new Date(futureDateMatch[0]);
        const diffTime = eolDate.getTime() - now.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (days > 0 && days <= 30) stats.next30++;
        if (days > 0 && days <= 60) stats.next60++;
        if (days > 0 && days <= 90) stats.next90++;
      }
    });
    return stats;
  }, [items]);

  // 3. Architecture Patterns (Pie)
  const architectureData = useMemo(() => {
    const archItems = items.filter(i => i.source === 'Architecture Center');
    const counts: Record<string, number> = {};
    
    archItems.forEach(item => {
      // Extract categories from categories array or infer from title
      const cats = item.categories || [];
      if (cats.length === 0) {
        // Fallback inference
        const text = item.title.toLowerCase();
        if (text.includes('data') || text.includes('analytics')) cats.push('Data & Analytics');
        else if (text.includes('ai') || text.includes('machine learning')) cats.push('AI & ML');
        else if (text.includes('security') || text.includes('compliance')) cats.push('Security');
        else if (text.includes('kubernetes') || text.includes('gke') || text.includes('container')) cats.push('Modernization');
        else if (text.includes('migration')) cats.push('Migration');
        else cats.push('Infrastructure');
      }
      
      cats.forEach(c => {
        if (c !== 'Architecture') { // Ignore generic tag
          counts[c] = (counts[c] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [items]);

  // 4. Deprecation Impact by Service (Bar)
  const deprecationData = useMemo(() => {
    const depItems = items.filter(i => i.source === 'Deprecations');
    const counts: Record<string, number> = {};
    
    depItems.forEach(item => {
      const products = extractGCPProducts(item.title + " " + item.contentSnippet);
      if (products.length > 0) {
        products.forEach(p => counts[p] = (counts[p] || 0) + 1);
      } else {
        counts['Other'] = (counts['Other'] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [items]);

  // 5. Product Momentum (Line Chart - Top 5 Products)
  const productMomentumData = useMemo(() => {
    // Identify top 5 products first
    const allCounts: Record<string, number> = {};
    items.forEach(item => {
      const products = extractGCPProducts(item.title + " " + item.contentSnippet);
      products.forEach(p => allCounts[p] = (allCounts[p] || 0) + 1);
    });
    const topProducts = Object.entries(allCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);

    // Generate weekly data for last 8 weeks
    const weeks = new Array(8).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 * (7 - i)));
      return d;
    });

    return weeks.map(weekStart => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekItems = items.filter(i => {
        const d = new Date(i.isoDate);
        return d >= weekStart && d < weekEnd;
      });

      const dataPoint: any = { date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      topProducts.forEach(p => {
        dataPoint[p] = 0;
        weekItems.forEach(item => {
          if (extractGCPProducts(item.title + " " + item.contentSnippet).includes(p)) {
            dataPoint[p]++;
          }
        });
      });
      return dataPoint;
    });
  }, [items]);

  // 6. Top GA Launches (Last 30 Days)
  const topLaunches = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return items
      .filter(i => new Date(i.isoDate) >= thirtyDaysAgo)
      .filter(i => {
        const text = (i.title + i.contentSnippet).toLowerCase();
        return text.includes('general availability') || text.includes(' ga ') || text.includes('available now');
      })
      .slice(0, 5);
  }, [items]);

  // 8. Incident Trends (Current Year)
  const incidentTrendData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearIncidents = items.filter(item => 
      item.source === 'Service Health' && 
      new Date(item.isoDate).getFullYear() === currentYear
    );

    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(currentYear, i, 1);
      return {
        name: d.toLocaleString('default', { month: 'short' }),
        active: 0,
        resolved: 0
      };
    });

    yearIncidents.forEach(item => {
      const monthIndex = new Date(item.isoDate).getMonth();
      if (!item.title.toLowerCase().includes('resolved')) {
        months[monthIndex].active++;
      } else {
        months[monthIndex].resolved++;
      }
    });

    const currentMonthIndex = new Date().getMonth();
    return months.slice(0, currentMonthIndex + 1);
  }, [items]);

  const recentIncidents = useMemo(() => {
    return items
      .filter(i => i.source === 'Service Health')
      .slice(0, 5);
  }, [items]);

  return {
    stats,
    securityTrendData,
    securityImpactData,
    deprecationTimelineStats,
    architectureData,
    deprecationData,
    productMomentumData,
    topLaunches,
    incidentTrendData,
    recentIncidents
  };
};
