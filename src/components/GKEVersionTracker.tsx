import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, AlertTriangle, CheckCircle, Clock, AlertOctagon, Calendar, ArrowRight, ExternalLink, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';

interface GKEVersion {
  version: string;
  date: string;
  status: 'Healthy' | 'Security Patch' | 'Deprecated';
  link: string;
  description: string;
}

interface GKEChannelInfo {
  name: 'Stable' | 'Regular' | 'Rapid';
  current: GKEVersion;
  history: GKEVersion[];
}

const FEED_URLS = {
  Stable: 'https://cloud.google.com/feeds/gke-stable-channel-release-notes.xml',
  Regular: 'https://cloud.google.com/feeds/gke-regular-channel-release-notes.xml',
  Rapid: 'https://cloud.google.com/feeds/gke-rapid-channel-release-notes.xml',
};

const fetchGKEVersions = async (): Promise<GKEChannelInfo[]> => {
  const fetchChannel = async (name: 'Stable' | 'Regular' | 'Rapid', url: string): Promise<GKEChannelInfo> => {
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Failed to fetch ${name} feed`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Support both Atom (entry) and RSS (item)
      let entries = Array.from(xmlDoc.querySelectorAll("entry"));
      if (entries.length === 0) {
        entries = Array.from(xmlDoc.querySelectorAll("item"));
      }

      if (entries.length === 0) throw new Error(`No entries found for ${name}`);

      const parseEntry = (entry: Element): GKEVersion => {
        const title = entry.querySelector("title")?.textContent || "";
        const content = entry.querySelector("content")?.textContent || entry.querySelector("description")?.textContent || "";
        const updated = entry.querySelector("updated")?.textContent || entry.querySelector("pubDate")?.textContent || new Date().toISOString();
        
        // Handle link extraction for both Atom (attribute) and RSS (text content)
        let link = "";
        const linkElem = entry.querySelector("link");
        if (linkElem) {
           link = linkElem.getAttribute("href") || linkElem.textContent || url;
        } else {
           link = url;
        }

        // Robust version extraction
        // Look for patterns like: 1.27.3-gke.100, 1.27.3, v1.27.3
        // Prioritize strict GKE pattern, then standard semver
        let version = "Unknown";
        
        const gkeRegex = /(\d+\.\d+\.\d+-gke\.\d+)/;
        const semverRegex = /v?(\d+\.\d+\.\d+)/;
        
        // 1. Try Title with GKE regex
        let match = title.match(gkeRegex);
        if (match) {
            version = match[1];
        } else {
            // 2. Try Title with Semver regex
            match = title.match(semverRegex);
            if (match) {
                version = match[1];
            } else {
                // 3. Try Content with GKE regex (often the version is in the description)
                match = content.match(gkeRegex);
                if (match) {
                    version = match[1];
                }
            }
        }

        // Determine status
        let status: 'Healthy' | 'Security Patch' | 'Deprecated' = 'Healthy';
        const lowerContent = (title + " " + content).toLowerCase();
        
        if (lowerContent.includes('security patch') || lowerContent.includes('vulnerability') || lowerContent.includes('cve')) {
          status = 'Security Patch';
        } else if (lowerContent.includes('deprecation') || lowerContent.includes('deprecated') || lowerContent.includes('removal')) {
          status = 'Deprecated';
        }

        return {
          version,
          date: new Date(updated).toLocaleDateString(),
          status,
          link,
          description: content.replace(/<[^>]*>?/gm, '').slice(0, 150) + "..."
        };
      };

      const versions = entries.map(parseEntry).filter(v => v.version !== "Unknown");
      
      // Fallback if no valid versions found
      if (versions.length === 0) {
         // If we found entries but couldn't parse versions, return the first entry with "Unknown" version
         // rather than throwing, so the user sees *something*
         const firstRaw = entries[0];
         const fallbackVersion: GKEVersion = {
             version: "Latest", // Fallback label
             date: new Date().toLocaleDateString(),
             status: 'Healthy',
             link: url,
             description: "Could not parse exact version number. Click to view release notes."
         };
         return {
             name,
             current: fallbackVersion,
             history: []
         };
      }

      const current = versions[0];
      const history = versions.slice(1, 5); // Get next 4 versions

      return {
        name,
        current,
        history
      };
    } catch (error) {
      console.error(`Error fetching ${name} channel:`, error);
      const errorVersion: GKEVersion = {
        version: 'Error',
        date: '-',
        status: 'Deprecated',
        link: url,
        description: 'Failed to load channel data.'
      };
      return {
        name,
        current: errorVersion,
        history: []
      };
    }
  };

  const channels = await Promise.all([
    fetchChannel('Stable', FEED_URLS.Stable),
    fetchChannel('Regular', FEED_URLS.Regular),
    fetchChannel('Rapid', FEED_URLS.Rapid),
  ]);

  return channels;
};

export const GKEVersionTracker: React.FC = () => {
  return (
    <ErrorBoundary componentName="GKEVersionTracker">
      <GKEVersionTrackerContent />
    </ErrorBoundary>
  );
};

const ChannelCard: React.FC<{ channel: GKEChannelInfo; index: number }> = ({ channel, index }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Security Patch': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'Deprecated': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
    }
  };

  const getChannelDescription = (name: string) => {
    switch (name) {
      case 'Stable': return 'Best for production workloads requiring maximum stability.';
      case 'Regular': return 'Standard channel for most production clusters.';
      case 'Rapid': return 'Early access to new features. Not for production.';
      default: return '';
    }
  };

  const statusStyles = getStatusColor(channel.current.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
    >
      <div className={`p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center ${
        channel.name === 'Stable' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' :
        channel.name === 'Rapid' ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-blue-50/50 dark:bg-blue-900/10'
      }`}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{channel.name} Channel</h3>
        {channel.current.status === 'Security Patch' && (
          <ShieldAlert size={18} className="text-red-500" />
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Current Version</span>
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
            {channel.current.version}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center">
            <Clock size={12} className="mr-1" /> Released: {channel.current.date}
          </div>
        </div>

        <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center ${statusStyles}`}>
            {channel.current.status === 'Healthy' && <CheckCircle size={14} className="mr-1.5" />}
            {channel.current.status === 'Security Patch' && <ShieldAlert size={14} className="mr-1.5" />}
            {channel.current.status === 'Deprecated' && <AlertTriangle size={14} className="mr-1.5" />}
            {channel.current.status.toUpperCase()}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-1">
          {channel.current.description}
        </p>

        {/* Collapsible History Section */}
        {channel.history.length > 0 && (
          <div className="mb-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 hover:text-blue-600 transition-colors"
            >
              <span>Recent History</span>
              {isHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pb-2">
                    {channel.history.map((hist, hIdx) => (
                      <div key={hIdx} className="flex justify-between items-center text-xs p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <span className="font-mono text-gray-700 dark:text-gray-300">{hist.version}</span>
                        <span className="text-gray-400">{hist.date}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 italic mb-3">
            {getChannelDescription(channel.name)}
          </p>
          <a 
            href={channel.current.link}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            Read Release Notes <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const GKEVersionTrackerContent: React.FC = () => {
  const { data: channels, isLoading, error } = useQuery({
    queryKey: ['gke-channels'],
    queryFn: fetchGKEVersions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
        <p className="text-gray-500 font-medium">Syncing with Google Cloud Release Feeds...</p>
      </div>
    );
  }

  if (error || !channels) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px] text-gray-400 dark:text-gray-500">
        <AlertTriangle size={48} className="mb-4 text-red-500 opacity-50" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Failed to load GKE data</h3>
        <p className="text-sm">Could not retrieve the latest GKE channel information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="text-blue-200" size={32} />
            <h2 className="text-2xl font-bold">GKE Release Channels</h2>
          </div>
          <p className="text-blue-100 max-w-2xl">
            Official release status tracked directly from Google Cloud feeds. 
            Monitor the latest versions across Stable, Regular, and Rapid channels.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((channel, index) => (
              <ChannelCard key={channel.name} channel={channel} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Source: <a href="https://cloud.google.com/kubernetes-engine/docs/release-notes" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud GKE Release Notes</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
