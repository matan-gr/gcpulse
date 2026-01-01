import { useState, useEffect, useMemo, Suspense, lazy, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useFeed, useDeprecations, useSecurityBulletins, useArchitectureUpdates, useIncidents } from './hooks/useFeed';
import { Toaster } from './components/ui/Toaster';
import { FeedItem } from './types';
import { GoogleGenAI } from "@google/genai";
import { useDebounce } from './hooks/useDebounce';
import { useUserPreferences } from './hooks/useUserPreferences';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useSummarizer } from './hooks/useSummarizer';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SummaryModal } from './components/SummaryModal';
import { PageLoader } from './components/ui/PageLoader';

// Layout & Navigation
import { AppLayout } from './components/layout/AppLayout';
import { TabNavigation } from './components/TabNavigation';

// Lazy Loaded Views
const DiscoverView = lazy(() => import('./views/DiscoverView').then(module => ({ default: module.DiscoverView })));
const DeprecationsView = lazy(() => import('./views/DeprecationsView').then(module => ({ default: module.DeprecationsView })));
const ArchitectureView = lazy(() => import('./views/ArchitectureView').then(module => ({ default: module.ArchitectureView })));
const StandardFeedView = lazy(() => import('./views/StandardFeedView').then(module => ({ default: module.StandardFeedView })));
const SavedView = lazy(() => import('./views/SavedView').then(module => ({ default: module.SavedView })));
const IncidentsView = lazy(() => import('./views/IncidentsView').then(module => ({ default: module.IncidentsView })));
const SecurityView = lazy(() => import('./views/SecurityView').then(module => ({ default: module.SecurityView })));
const GeminiAssistantView = lazy(() => import('./views/GeminiAssistantView').then(module => ({ default: module.GeminiAssistantView })));
const DashboardView = lazy(() => import('./views/DashboardView').then(module => ({ default: module.DashboardView })));
const ToolsView = lazy(() => import('./views/ToolsView').then(module => ({ default: module.ToolsView })));

// Initialize Gemini
const apiKey = window.ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

function AppContent() {
  // UI State
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'incidents' | 'deprecations' | 'security' | 'architecture' | 'tools' | 'dashboard' | 'assistant'>('all');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Fetching with React Query
  const { data: feed, isLoading: feedLoading, error: queryError, refetch: refetchFeed, isRefetching: feedRefetching } = useFeed();
  const { data: deprecations, isLoading: deprecationsLoading, error: deprecationsError } = useDeprecations();
  const { data: securityBulletins, isLoading: securityLoading, error: securityError } = useSecurityBulletins();
  const { data: architectureUpdates, isLoading: architectureLoading, error: architectureError } = useArchitectureUpdates();
  const { data: incidents, isLoading: incidentsLoading, error: incidentsError } = useIncidents();
  
  const loading = feedLoading || (activeTab === 'architecture' && architectureLoading) || (activeTab === 'incidents' && incidentsLoading); // Main loading state

  // Custom Hooks
  const { prefs, updatePrefs, toggleCategorySubscription, toggleSavedPost, clearSavedPosts } = useUserPreferences();
  const { summarizingId, analyses, summaryModal, handleSummarize, closeSummaryModal } = useSummarizer();

  // Feed Update Toast
  const prevRefetching = useRef(false);
  useEffect(() => {
    if (prevRefetching.current && !feedRefetching && !queryError) {
      toast.success("Feed updated");
    }
    prevRefetching.current = feedRefetching;
  }, [feedRefetching, queryError]);

  // Error Handling
  useEffect(() => {
    if (queryError) toast.error("Failed to load feed updates.");
    if (deprecationsError) toast.error("Failed to load deprecation notices.");
    if (architectureError) toast.error("Failed to load architecture updates.");
    if (incidentsError) toast.error("Failed to load incidents.");
    if (deprecations && !deprecationsLoading && activeTab === 'deprecations') {
      toast.success("Deprecation roadmap updated", { icon: <Check size={16} />, duration: 3000 });
    }
  }, [queryError, deprecationsError, architectureError, incidentsError, deprecations, deprecationsLoading, activeTab]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [isSmartFilter, setIsSmartFilter] = useState(false);
  const [smartIndices, setSmartIndices] = useState<number[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Use prefs for persistence
  const selectedCategory = prefs.filterCategory;
  const dateRange = prefs.filterDateRange;
  
  const handleCategoryChange = (category: string | null) => {
    updatePrefs({ filterCategory: category });
  };

  const handleDateRangeChange = (range: { start: string; end: string } | null) => {
    updatePrefs({ filterDateRange: range });
    if (range) toast.success("Date filter applied");
    else toast.info("Date filter cleared");
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("No items to export.");
      return;
    }

    const headers = ["Date", "Title", "Category", "Link", "Source"];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(item => {
        const date = new Date(item.isoDate).toLocaleDateString();
        const title = `"${item.title.replace(/"/g, '""')}"`;
        const category = `"${(item.categories || []).join("; ")}"`;
        return [date, title, category, item.link, item.source].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gcp_pulse_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredItems.length} items to CSV`);
  };

  const debouncedSearch = useDebounce(search, 800);

  // Merge items for filtering and display
  const allItems = useMemo(() => {
    const itemMap = new Map<string, FeedItem>();

    // 1. Add raw feed items first
    (feed?.items || []).forEach(item => itemMap.set(item.id, item));

    // 2. Overlay specialized items (they have enhanced metadata/categories)
    (deprecations || []).forEach(item => itemMap.set(item.id, item));
    (securityBulletins || []).forEach(item => itemMap.set(item.id, item));
    (architectureUpdates || []).forEach(item => itemMap.set(item.id, item));

    // 3. Add incidents (distinct source)
    (incidents || []).forEach(item => itemMap.set(item.id, item));

    return Array.from(itemMap.values()).sort((a, b) => {
      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });
  }, [feed, deprecations, securityBulletins, architectureUpdates, incidents]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allItems.forEach(item => item.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [allItems]);

  // Smart Filter Logic
  useEffect(() => {
    if (!isSmartFilter || !debouncedSearch || allItems.length === 0) {
      setSmartIndices(null);
      return;
    }

    const fetchSmartFilter = async () => {
      setIsAiLoading(true);
      try {
        const itemsSummary = allItems.map((item, index) => ({
          index,
          title: item.title,
          snippet: item.contentSnippet?.slice(0, 200) || ""
        }));

        const prompt = `
          You are a helpful assistant filtering a blog feed.
          User Query: "${debouncedSearch}"
          Here are the blog posts: ${JSON.stringify(itemsSummary)}
          Return a JSON array of the indices (integers) of the posts that are most relevant to the user's query.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        
        const indices = JSON.parse(response.text || '[]');
        setSmartIndices(indices);
        indices.length === 0 ? toast.info("No AI matches found.") : toast.success(`AI found ${indices.length} articles.`);
      } catch (e) {
        console.error("AI Filter Error:", e);
        toast.error("AI filtering failed.");
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchSmartFilter();
  }, [debouncedSearch, isSmartFilter, allItems]);

  // Filter Items
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (activeTab === 'saved') items = items.filter(item => prefs.savedPosts.includes(item.link));
    else if (activeTab === 'incidents') items = items.filter(item => item.source === 'Service Health');
    else if (activeTab === 'deprecations') items = items.filter(item => item.source === 'Deprecations');
    else if (activeTab === 'security') items = items.filter(item => item.source === 'Security Bulletins');
    else if (activeTab === 'architecture') items = items.filter(item => item.source === 'Architecture Center');

    if (isSmartFilter && smartIndices !== null) {
      const smartItems = smartIndices.map(i => allItems[i]).filter(Boolean);
      const smartLinks = new Set(smartItems.map(i => i.link));
      items = items.filter(item => smartLinks.has(item.link));
    } else if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.contentSnippet?.toLowerCase().includes(lowerSearch) ||
        item.categories?.some(cat => cat.toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedCategory) items = items.filter(item => item.categories?.includes(selectedCategory));

    if (dateRange?.start) {
      const start = new Date(dateRange.start).getTime();
      items = items.filter(item => new Date(item.isoDate).getTime() >= start);
    }
    if (dateRange?.end) {
      const end = new Date(dateRange.end).getTime();
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      items = items.filter(item => new Date(item.isoDate).getTime() < endDate.getTime());
    }

    return items;
  }, [allItems, search, isSmartFilter, smartIndices, selectedCategory, dateRange, activeTab, prefs.savedPosts]);

  const handleSave = (item: FeedItem) => {
    toggleSavedPost(item.link);
  };

  if (queryError) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ErrorDisplay message="We couldn't load the latest updates." onRetry={() => refetchFeed()} />
        </div>
    );
  }

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isPresentationMode={isPresentationMode}
      setIsPresentationMode={setIsPresentationMode}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      search={search}
      setSearch={setSearch}
      isSmartFilter={isSmartFilter}
      setIsSmartFilter={setIsSmartFilter}
      isAiLoading={isAiLoading}
      categories={categories}
      selectedCategory={selectedCategory}
      handleCategoryChange={handleCategoryChange}
      dateRange={dateRange}
      handleDateRangeChange={handleDateRangeChange}
      viewMode={prefs.viewMode}
      onViewModeChange={(mode) => updatePrefs({ viewMode: mode })}
      onExportCSV={handleExportCSV}
    >
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSearch={setSearch}
        setIsSmartFilter={setIsSmartFilter}
        handleCategoryChange={handleCategoryChange}
        handleDateRangeChange={handleDateRangeChange}
        savedCount={prefs.savedPosts.length}
        isPresentationMode={isPresentationMode}
      />

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'tools' ? (
              <ToolsView />
            ) : activeTab === 'dashboard' ? (
              <DashboardView 
                items={allItems} 
                onNavigateToIncidents={() => setActiveTab('incidents')}
              />
            ) : activeTab === 'assistant' ? (
              <GeminiAssistantView items={allItems} />
            ) : activeTab === 'incidents' ? (
              <IncidentsView 
                items={filteredItems} 
                loading={loading}
              />
            ) : activeTab === 'deprecations' ? (
              <DeprecationsView items={filteredItems} loading={deprecationsLoading} />
            ) : activeTab === 'architecture' ? (
              <ArchitectureView 
                items={filteredItems} 
                loading={architectureLoading}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                isPresentationMode={isPresentationMode}
              />
            ) : activeTab === 'security' ? (
              <SecurityView 
                items={filteredItems} 
                loading={securityLoading}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
              />
            ) : activeTab === 'saved' ? (
              <SavedView
                items={filteredItems}
                loading={loading}
                viewMode={prefs.viewMode}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                subscribedCategories={prefs.subscribedCategories}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
                onClearAll={clearSavedPosts}
                onExplore={() => setActiveTab('all')}
              />
            ) : activeTab === 'all' ? (
              <DiscoverView
                items={filteredItems}
                loading={loading}
                prefs={prefs}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
                isAiLoading={isAiLoading}
                onToggleColumnVisibility={(column) => {
                  const isHidden = prefs.hiddenColumns.includes(column);
                  updatePrefs({
                    hiddenColumns: isHidden 
                      ? prefs.hiddenColumns.filter(c => c !== column)
                      : [...prefs.hiddenColumns, column]
                  });
                }}
                onUpdateColumnOrder={(order) => updatePrefs({ columnOrder: order })}
              />
            ) : (
              <StandardFeedView
                items={filteredItems}
                loading={loading}
                viewMode={prefs.viewMode}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                subscribedCategories={prefs.subscribedCategories}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Suspense>

      {summaryModal && (
        <SummaryModal 
          isOpen={summaryModal.isOpen}
          onClose={closeSummaryModal}
          title={summaryModal.title}
          analysis={summaryModal.analysis}
          streamContent={summaryModal.streamContent}
          isStreaming={summaryModal.isStreaming}
        />
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
