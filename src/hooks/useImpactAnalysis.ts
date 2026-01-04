import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FeedItem } from '../types';

const apiKey = window.ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

interface ImpactTag {
  type: 'security' | 'cost' | 'feature' | 'deprecation' | 'performance';
  level: 'high' | 'medium' | 'low';
  label: string;
}

// Simple in-memory cache to persist across re-renders
const analysisCache: Record<string, ImpactTag[]> = {};
const FAILED_IDS = new Set<string>();

export const useImpactAnalysis = () => {
  const [analyzedItems, setAnalyzedItems] = useState<Record<string, ImpactTag[]>>(analysisCache);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  
  // Rate limiting queue
  const queueRef = useRef<Array<() => Promise<void>>>([]);
  const processingRef = useRef(false);
  
  // Exponential backoff retry logic
  const retryWithBackoff = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const processQueue = async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    while (queueRef.current.length > 0) {
      const task = queueRef.current.shift();
      if (task) {
        await task();
        // Base delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    processingRef.current = false;
  };

  const analyzeItem = useCallback(async (item: FeedItem) => {
    if (!item.id || analyzedItems[item.id] || analysisCache[item.id] || analyzing.has(item.id) || FAILED_IDS.has(item.id)) return;

    setAnalyzing(prev => new Set(prev).add(item.id!));

    const task = async () => {
      try {
        const prompt = `
          Analyze this Google Cloud update and assign 1-2 impact tags.
          Title: "${item.title}"
          Content: "${item.contentSnippet?.slice(0, 300)}"
          
          Return ONLY a JSON array of objects with keys: "type" (security, cost, feature, deprecation, performance), "level" (high, medium, low), and "label" (short 1-2 word description).
          Example: [{"type": "cost", "level": "high", "label": "Price Drop"}, {"type": "feature", "level": "medium", "label": "New Region"}]
        `;

        const response = await retryWithBackoff(() => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        }));

        const tags = JSON.parse(response.text || '[]');
        analysisCache[item.id!] = tags; // Update cache
        setAnalyzedItems(prev => ({ ...prev, [item.id!]: tags }));
      } catch (error: any) {
        console.error("Failed to analyze item impact:", error);
        if (error.status === 429 || error.message?.includes('429')) {
          FAILED_IDS.add(item.id!); 
        }
      } finally {
        setAnalyzing(prev => {
          const next = new Set(prev);
          next.delete(item.id!);
          return next;
        });
      }
    };

    queueRef.current.push(task);
    processQueue();

  }, [analyzedItems, analyzing]);

  return { analyzedItems, analyzeItem };
};
