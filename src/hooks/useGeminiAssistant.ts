import { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FeedItem } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const getApiKey = () => {
  const env = (window as any).ENV;
  if (env && env.GEMINI_API_KEY) {
    return env.GEMINI_API_KEY;
  }
  return process.env.GEMINI_API_KEY || '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const useGeminiAssistant = (items: FeedItem[]) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Context Selection State
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [manualContextIds, setManualContextIds] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter and prioritize items for the context window
  const criticalContext = useMemo(() => {
    // 1. Get Manually Selected Items
    const manualItems = items.filter(item => manualContextIds.includes(item.id));

    // 2. Score remaining items
    const remainingItems = items.filter(item => !manualContextIds.includes(item.id));
    
    const scoredItems = remainingItems.map(item => {
      let score = 0;
      const text = (item.title + " " + item.contentSnippet).toLowerCase();
      const isRecent = new Date(item.isoDate).getTime() > Date.now() - (14 * 24 * 60 * 60 * 1000); // Last 14 days

      // 1. Critical Security (Highest Priority)
      if (item.source === 'Security Bulletins') {
        if (text.includes('critical')) score += 100;
        else if (text.includes('high')) score += 80;
        else score += 50;
      }

      // 2. Active Incidents
      if (item.source === 'Service Health') {
        if (!text.includes('resolved')) score += 90; // Active
        else if (isRecent) score += 40; // Recently resolved
      }

      // 3. Urgent Deprecations
      if (item.source === 'Deprecations') {
        if (text.includes('2025') || text.includes('immediate')) score += 70;
        else score += 30;
      }

      // 4. Architecture & Major Updates
      if (item.source === 'Architecture Center') score += 30; // Increased weight for architecture
      if (item.source === 'Product Updates') {
         if (text.includes('ga') || text.includes('general availability')) score += 25;
         else if (isRecent) score += 10;
      }

      return { item, score };
    });

    // 3. Combine: Manual Items + Top Auto-Scored Items (up to limit)
    const autoLimit = Math.max(0, 60 - manualItems.length);
    
    const topAutoItems = scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, autoLimit)
      .map(s => s.item);

    return [...manualItems, ...topAutoItems];
  }, [items, manualContextIds]);

  const contextData = useMemo(() => JSON.stringify(criticalContext.map(i => ({
    title: i.title,
    source: i.source,
    date: i.isoDate,
    summary: i.contentSnippet?.slice(0, 300),
    isManualSelection: manualContextIds.includes(i.id) // Flag for the AI
  }))), [criticalContext, manualContextIds]);

    const SYSTEM_INSTRUCTION = `
    You are an elite Senior Technical Account Manager (TAM) and Cloud Architect at Google Cloud, serving top-tier enterprise clients.
    Your goal is to provide **proactive, high-value strategic advice** by synthesizing official feed data with deep technical knowledge and external official resources.

    **CORE MISSION:**
    Transform raw updates into **strategic intelligence**. Don't just report *what* happened; explain *why* it matters to a CTO, CISO, or VP of Engineering, and *what* they should do about it.

    **OPERATIONAL DIRECTIVES:**
    1.  **Proactive & Prescriptive:**
        *   Anticipate risks (security, stability, deprecations) before they become incidents.
        *   **Proactive Issue Identification:** Explicitly look for patterns that suggest potential stability or security risks.
        *   **Optimization Opportunities:** Identify new features that could reduce costs, improve performance, or simplify architecture.
        *   Recommend specific actions (e.g., "Enable this policy," "Migrate this workload," "Review this architecture").
        *   Use phrases like "I recommend," "Critical action required," and "Strategic opportunity."

    2.  **Deep Grounding & Expansion:**
        *   Use the provided "Data Context" as the foundation.
        *   **MANDATORY:** Use your search tools to find and cite the *exact* official documentation, release notes, or architecture guides from \`cloud.google.com\` or \`blog.google\`.
        *   Never hallucinate URLs.

    3.  **Enterprise-Grade Communication:**
        *   **Tone:** Professional, confident, concise, and authoritative. Use "we" when referring to Google Cloud best practices.
        *   **Structure:** Use clear headings, bullet points, and bold text for readability.
        *   **Executive Summary:** Always start with a 2-sentence TL;DR for executives.

    4.  **Format Requirements (Markdown):**
        *   **# Headlines:** Clear and descriptive.
        *   **> Blockquotes:** Use for "Strategic Implications" or "Business Value".
        *   **Code Blocks:** Use for specific gcloud commands or policy snippets.
        *   **Tables:** Use for comparing features or listing deprecation timelines.
        *   **Actionable Recommendations:** Use a distinct section for specific next steps.

    **Data Context (Official Feeds):**
    ${contextData}
  `;

  const handleError = (error: any) => {
    // Don't log expected quota errors as errors to the console to reduce noise
    const errorStr = JSON.stringify(error);
    const isQuotaError = 
      error.message?.includes('429') || 
      error.status === 429 || 
      error.message?.includes('quota') ||
      error.error?.code === 429 ||
      error.error?.status === 'RESOURCE_EXHAUSTED' ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('"code":429');

    const isBillingError = errorStr.includes('billing') || errorStr.includes('plan');

    if (isQuotaError) {
      console.warn("Gemini API Quota Exceeded:", error.message || "Unknown quota error");
    } else {
      console.error("Gemini API Error:", error);
    }

    let errorMessage = "I encountered an error processing your request.";

    if (isBillingError) {
      errorMessage = "⚠️ **Billing Quota Exceeded**: You have reached the hard quota limit for your Google Cloud project. Please check your billing details and quota limits in the Google Cloud Console.";
    } else if (isQuotaError) {
      errorMessage = "⚠️ **Rate Limit Exceeded**: The system is under heavy load. Please wait a moment before trying again.";
    } else if (error.message) {
        // Expose the actual error message for debugging
        errorMessage = `**Error**: ${error.message}`;
        if (error.errorDetails) {
            errorMessage += `\n\n*Details*: ${JSON.stringify(error.errorDetails)}`;
        }
    }
    
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: errorMessage,
      timestamp: new Date()
    }]);
  };

  const generateWithRetry = async (call: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
    try {
      return await call();
    } catch (error: any) {
      const errorStr = JSON.stringify(error);
      const isQuotaError = 
        error.message?.includes('429') || 
        error.status === 429 || 
        error.message?.includes('quota') ||
        error.error?.code === 429 ||
        error.error?.status === 'RESOURCE_EXHAUSTED' ||
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('"code":429');
      
      const isBillingError = errorStr.includes('billing') || errorStr.includes('plan');

      // Do not retry if it's a hard billing quota error
      if (isQuotaError && !isBillingError && retries > 0) {
        console.warn(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateWithRetry(call, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Cache for the weekly briefing
  const briefingCache = useRef<{ content: string; timestamp: number } | null>(null);
  const BRIEFING_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const generateBriefing = async () => {
    // Check cache first
    if (briefingCache.current && (Date.now() - briefingCache.current.timestamp < BRIEFING_CACHE_DURATION)) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: briefingCache.current!.content,
        timestamp: new Date()
      }]);
      setLastUpdated(new Date(briefingCache.current.timestamp));
      return;
    }

    setLoading(true);
    // Filter for last 7 days only for this specific briefing
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyItems = items.filter(item => new Date(item.isoDate) >= oneWeekAgo);
    
    // If no items in last week, fall back to last 30 days but mention it
    const contextItems = weeklyItems.length > 0 ? weeklyItems : items.slice(0, 20);
    const timeWindow = weeklyItems.length > 0 ? "Last 7 Days" : "Recent Updates (Low volume week)";

    const weeklyContext = JSON.stringify(contextItems.map(i => ({
      title: i.title,
      source: i.source,
      date: i.isoDate,
      summary: i.contentSnippet?.slice(0, 300)
    })));

    try {
      const prompt = `
        ${SYSTEM_INSTRUCTION}

        **Context (${timeWindow}):**
        ${weeklyContext}

        **Task:**
        Generate a **Deep-Dive Weekly TAM Briefing** for my enterprise customers.
        
        **Directives:**
        1.  **Synthesize:** Don't just summarize. Group updates by theme (e.g., "AI & Data", "Security & Governance", "Infrastructure").
        2.  **Enrich:** Use Google Search to find the *official documentation link* or a *deep-dive blog post* for the top 3 most important updates and include them.
        3.  **Strategize:** For each major update, provide a "TAM Take" on the business impact.

        **Required Output Format (Markdown):**
        
        # 🚀 Weekly Executive Briefing
        (A strategic summary of the week's landscape. 2-3 sentences max.)

        ## 🎯 Strategic Focus Areas
        
        ### 1. [Theme/Major Update]
        *   **The Update:** [Concise description]
        *   **TAM Take:** > [Strategic insight/Business value]
        *   **Action:** [Specific recommendation]
        *   **Resource:** [Link to official doc found via search]

        ### 2. [Theme/Major Update]
        ...

        ## 📡 Risk & Governance Radar
        *   **🛡️ Security:** [Critical alerts or "Nominal"]
        *   **⚡ Stability:** [Major incidents or "Stable"]
        *   **⏳ Deprecations:** [Urgent EOLs]

        ## 💡 Innovation Spotlight
        *(A feature that enables new capabilities, enriched with external context)*
      `;

      const response = await generateWithRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }] 
        }
      }));

      const briefingText = response.text || "Unable to generate briefing.";
      
      // Update Cache
      briefingCache.current = { content: briefingText, timestamp: Date.now() };

      // Add as a new message instead of clearing
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: briefingText,
        timestamp: new Date()
      }]);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Briefing generation failed:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Construct the full conversation history for the prompt
      const conversationHistory = newMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

      const prompt = `
        ${SYSTEM_INSTRUCTION}

        **Conversation History:**
        ${conversationHistory}

        **User's Latest Question:**
        ${text}

        **Task:**
        Answer the user's question acting as a Senior TAM. 
        Use Google Search to find the most up-to-date official documentation or pricing details if the feed data is insufficient.
        Always cite official sources.
      `;

      const response = await generateWithRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }] 
        }
      }));

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "I couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat failed:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate removed to save resources
  // useEffect(() => {
  //   if (items.length > 0 && messages.length === 0) {
  //     generateBriefing();
  //   }
  // }, [items.length]);

  return {
    messages,
    input,
    setInput,
    loading,
    lastUpdated,
    messagesEndRef,
    isContextModalOpen,
    setIsContextModalOpen,
    manualContextIds,
    setManualContextIds,
    generateBriefing,
    handleSendMessage
  };
};
