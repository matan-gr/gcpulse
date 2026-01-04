import { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FeedItem } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const apiKey = window.ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

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
    You are an expert Senior Technical Account Manager (TAM), Site Reliability Engineer (SRE), and Cloud Architect at Google Cloud.
    Your role is to advise enterprise customers based **STRICTLY** on the provided official Google Cloud feed data.

    **CORE DIRECTIVES:**
    1.  **Official Data Only:** Do not hallucinate features or incidents. If the information is not in the provided "Data Context", state clearly: "I don't have information on that in the current official feeds."
    2.  **Persona:** Act as a strategic advisor. Be proactive, professional, and concise. Use "we" to refer to Google Cloud.
    3.  **Format:** 
        *   Use **Markdown** for all output.
        *   Use **Headers** (#, ##, ###) to structure sections.
        *   Use **Bold** for key entities, feature names, and dates to trigger highlighting.
        *   Use **> Blockquotes** for "Strategic Insights", "Critical Alerts", or "Pro Tips" to create distinct visual boxes.
        *   Use **Lists** for readability.
    4.  **Context Awareness:** You are aware of the conversation history. Answer follow-up questions based on previous context.
    5.  **User Selections:** Pay special attention to items marked with "isManualSelection: true" in the data context, as the user has explicitly flagged them for analysis.

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

  const generateWithRetry = async (call: () => Promise<any>, retries = 3, delay = 2000): Promise<any> => {
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

  const generateBriefing = async () => {
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
        Generate a **Weekly TAM Briefing** for my enterprise customers.
        
        **Persona:** 
        You are a **Customer-Obsessed Senior GCP Technical Account Manager**. You are proactive, strategic, and focused on business value and risk mitigation.

        **Required Output Format (Markdown):**
        
        # 🚀 Weekly Executive Summary
        (A concise, high-level summary of the week's most critical events. Focus on impact.)

        ## 🗣️ Key Talking Points
        *(3 strategic topics to proactively raise with customers)*
        *   **[Topic]**: [Why it matters] -> [Call to Action: "Ask if...", "Suggest..."]

        ## 📡 Risk Radar
        *(Assess risks based on the provided data)*
        *   **🛡️ Security**: (Summary of critical vulnerabilities or "No critical alerts")
        *   **⚡ Stability**: (Summary of major incidents or "Stable")
        *   **⏳ Deprecations**: (Urgent EOLs within 90 days)

        ## 💡 Innovation Spotlight
        *(One feature/update that drives business value)*
        *   **[Feature]**: [Value Proposition]
      `;

      const response = await generateWithRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      }));

      const briefingText = response.text || "Unable to generate briefing.";
      
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
        Answer the user's question acting as a Senior TAM. Refer to the Data Context and Conversation History.
      `;

      const response = await generateWithRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
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

  // Auto-generate on first load if we have items
  useEffect(() => {
    if (items.length > 0 && messages.length === 0) {
      generateBriefing();
    }
  }, [items.length]);

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
