export function extractImage(content: string): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

const GCP_PRODUCTS = [
  "Compute Engine", "App Engine", "Kubernetes Engine", "GKE", "Cloud Functions", "Cloud Run",
  "Cloud Storage", "Persistent Disk", "Filestore",
  "BigQuery", "Cloud SQL", "Cloud Spanner", "Bigtable", "Firestore", "Memorystore",
  "VPC", "Cloud Load Balancing", "Cloud CDN", "Cloud DNS",
  "Anthos", "Apigee",
  "Vertex AI", "AutoML", "Dialogflow", "Vision API", "Translation API", "Natural Language API",
  "Pub/Sub", "Dataflow", "Dataproc", "Looker",
  "Cloud Build", "Artifact Registry", "Container Registry",
  "IAM", "Cloud Armor", "Secret Manager", "KMS",
  "Operations Suite", "Cloud Logging", "Cloud Monitoring"
];

export function extractGCPProducts(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  
  GCP_PRODUCTS.forEach(product => {
    if (lowerText.includes(product.toLowerCase())) {
      found.add(product);
    }
  });
  
  return Array.from(found);
}

export function extractEOLDate(text: string): Date | null {
  if (!text) return null;
  
  // 1. Look for "YYYY-MM-DD"
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return new Date(isoMatch[0]);

  // 2. Look for "Month DD, YYYY" (e.g., "January 15, 2025")
  const longDateMatch = text.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/);
  if (longDateMatch) {
    const date = new Date(longDateMatch[0]);
    if (!isNaN(date.getTime())) return date;
  }

  // 3. Look for "DD Month YYYY" (e.g., "15 January 2025")
  const euDateMatch = text.match(/(\d{1,2} [A-Z][a-z]+ \d{4})/);
  if (euDateMatch) {
     const date = new Date(euDateMatch[0]);
     if (!isNaN(date.getTime())) return date;
  }

  return null;
}
