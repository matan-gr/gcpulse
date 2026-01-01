import express from "express";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";

const app = express();
const PORT = 3000;
const FEEDS = [
  { url: "https://cloudblog.withgoogle.com/rss/", name: "Cloud Blog" },
  { url: "https://blog.google/products/google-cloud/rss/", name: "Product Updates" },
  { url: "https://cloud.google.com/feeds/gcp-release-notes.xml", name: "Release Notes" },
  { url: "https://docs.cloud.google.com/feeds/google-cloud-security-bulletins.xml", name: "Security Bulletins" },
  { url: "https://cloud.google.com/feeds/architecture-center-release-notes.xml", name: "Architecture Center" }
];
const parser = new Parser();

// Middleware to parse JSON
app.use(express.json());

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Helper to clean text
const cleanText = (text: string | undefined) => {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp;
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

// Cache configuration
let cache: {
  data: any;
  timestamp: number;
} | null = null;
const CACHE_DURATION = 0; // Disable cache temporarily to force fresh IDs

// API Routes
app.get("/api/feed", async (req, res) => {
  try {
    // Check cache
    if (cache && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      return res.json(cache.data);
    }

    const feedPromises = FEEDS.map(async (feedSource) => {
      try {
        const feed = await parser.parseURL(feedSource.url);
        return feed.items.map(item => ({
          ...item,
          source: feedSource.name,
          title: cleanText(item.title),
          contentSnippet: cleanText(item.contentSnippet || item.content),
          content: item.content || item.contentSnippet || "", // Keep full content
          // Ensure isoDate exists or create it from pubDate
          isoDate: item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString())
        }));
      } catch (error) {
        console.error(`Error fetching feed ${feedSource.name}:`, error);
        return [];
      }
    });

    const allItemsArrays = await Promise.all(feedPromises);
    // Merge RSS items
    const allItems = allItemsArrays.flat();

    // Ensure unique IDs to prevent React key errors
    // We append the index to ALL IDs to guarantee uniqueness and stability within a single fetch
    allItems.forEach((item, index) => {
      const baseId = item.id || item.guid || item.link || `generated`;
      item.id = `${baseId}-${index}`;
    });

    // Sort by date descending
    allItems.sort((a, b) => {
      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });

    const responseData = {
      title: "Aggregated GCP Feeds",
      description: "Aggregated news and updates from Google Cloud",
      items: allItems
    };

    // Update cache
    cache = {
      data: responseData,
      timestamp: Date.now()
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching RSS feeds:", error);
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

app.get("/api/incidents", async (req, res) => {
  try {
    const response = await fetch("https://status.cloud.google.com/incidents.json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.statusText}`);
    }
    const data = await response.json();

    const incidents = data.map((item: any) => {
      // Extract content from updates
      let content = "";
      if (item.most_recent_update?.text) {
        content = item.most_recent_update.text;
      } else if (item.updates && item.updates.length > 0) {
        content = item.updates[0].text;
      }

      // Defensive extraction
      const serviceName = item.service_name || item.service_key || "GCP Service";
      const severity = item.severity || item.priority || "medium"; // Default to medium if unknown
      const description = item.external_desc || item.summary || content || "No description available";
      
      return {
        id: item.uri || item.id || `incident-${Math.random()}`,
        title: description, // Use description as title for the feed item
        link: `https://status.cloud.google.com${item.uri || ''}`,
        isoDate: item.begin || new Date().toISOString(),
        source: 'Service Health',
        content: content,
        contentSnippet: content,
        
        // Specific Incident Fields
        serviceName: serviceName,
        severity: severity,
        description: description,
        updates: item.updates || [], // Pass full updates array
        begin: item.begin,
        end: item.end,
        isActive: !item.end, // Active if no end date
        isHistory: !!item.end
      };
    });

    // Sort by Date Descending (Active first, then by date)
    incidents.sort((a: any, b: any) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });

    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

app.get("/api/ip-ranges", async (req, res) => {
  try {
    const response = await fetch("https://www.gstatic.com/ipranges/cloud.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch IP ranges: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching IP ranges:", error);
    res.status(500).json({ error: "Failed to fetch IP ranges" });
  }
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: {
        server
      }
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static('dist'));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist' });
  });
}
