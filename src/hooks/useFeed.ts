import { useQuery } from '@tanstack/react-query';
import { Feed, FeedItem } from '../types';
import { extractGCPProducts } from '../utils';

const fetchFeed = async (): Promise<Feed> => {
  try {
    const response = await fetch('/api/feed');
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch Feed Error:", error);
    throw error;
  }
};

export const useFeed = () => {
  return useQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useDeprecations = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      const deprecationKeywords = ['deprecation', 'deprecated', 'removal', 'shutdown', 'end of life', 'eol', 'discontinued'];
      
      return data.items.filter(item => {
        // Filter by source 'Release Notes' (which contains deprecations) OR explicit 'Deprecations' source if we had one
        // Also check content for keywords
        if (item.source !== 'Release Notes' && item.source !== 'Deprecations') return false;
        
        const text = `${item.title} ${item.contentSnippet || item.content}`.toLowerCase();
        return deprecationKeywords.some(keyword => text.includes(keyword));
      }).map(item => ({
        ...item,
        source: 'Deprecations', // Override source for UI consistency
        categories: ['Deprecation', ...(item.categories || [])]
      }));
    }
  });
};

export const useSecurityBulletins = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Security Bulletins').map(item => {
        // Robust Severity Extraction
        let severity = 'Unknown';
        const textToSearch = (item.title + " " + (item.content || item.contentSnippet)).toLowerCase();
        
        // Check for explicit "Severity: X" patterns first
        const severityMatch = textToSearch.match(/severity:\s*(critical|high|medium|low)/i);
        if (severityMatch) {
          severity = severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1);
        } else {
          // Fallback to keyword search with word boundaries
          if (/\bcritical\b/.test(textToSearch)) severity = 'Critical';
          else if (/\bhigh\b/.test(textToSearch)) severity = 'High';
          else if (/\bmedium\b/.test(textToSearch)) severity = 'Medium';
          else if (/\blow\b/.test(textToSearch)) severity = 'Low';
        }

        const categories = ['Security', 'Bulletin'];
        if (severity !== 'Unknown') categories.push(severity);
        if (item.categories) categories.push(...item.categories);

        return {
          ...item,
          categories: Array.from(new Set(categories))
        };
      });
    }
  });
};

export const useArchitectureUpdates = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Architecture Center').map(item => {
        const products = extractGCPProducts(item.title + " " + (item.content || item.contentSnippet));
        
        // Fix relative or missing links
        let link = item.link || '';
        
        if (link.startsWith('#')) {
          // Handle anchor links common in release notes
          link = `https://docs.cloud.google.com/architecture/release-notes${link}`;
        } else if (link.startsWith('/')) {
          // Handle absolute paths relative to domain
          link = `https://cloud.google.com${link}`;
        } else if (!link.startsWith('http')) {
          // Fallback or relative path without slash
          if (link) {
             link = `https://cloud.google.com/${link}`;
          } else {
             link = 'https://docs.cloud.google.com/architecture/release-notes';
          }
        }

        return {
          ...item,
          link,
          categories: Array.from(new Set(['Architecture', ...products, ...(item.categories || [])]))
        };
      });
    }
  });
};

export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async (): Promise<FeedItem[]> => {
      const response = await fetch('/api/incidents');
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
