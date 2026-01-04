# Deployment Guide: GCP Pulse

This guide provides step-by-step instructions for deploying the GCP Pulse application to **Google Cloud Run**.

## 🏗️ Architecture

The application is a **single-container Node.js application**:
*   **Backend**: An Express.js server (`server.ts`) that:
    1.  Serves the React frontend (static files from `dist/`).
    2.  Proxies API requests to Google Cloud feeds (to avoid CORS issues).
    3.  **Injects the Gemini API Key** into the frontend at runtime.
*   **Frontend**: A React application built with Vite.

## 🔑 API Key Configuration (CRITICAL)

The application **requires** a valid Google Gemini API Key to function. This key is used for:
1.  Generating executive summaries.
2.  Powering the AI Assistant chat.
3.  Smart filtering of feed items.

**You must provide this key as an environment variable (`GEMINI_API_KEY`) when deploying.**

## 🚀 Deploying to Google Cloud Run

### Prerequisites

1.  **Google Cloud Project**: Create one at [console.cloud.google.com](https://console.cloud.google.com/).
2.  **Billing Enabled**: Ensure billing is active.
3.  **Google Cloud SDK (gcloud)**: Installed and authenticated.
    *   Run `gcloud auth login`
    *   Run `gcloud config set project YOUR_PROJECT_ID`

### Step 1: Build and Push the Container

Use **Cloud Build** to build the Docker image and store it in Google Container Registry (GCR) or Artifact Registry.

```bash
# Replace YOUR_PROJECT_ID with your actual project ID
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/gcp-pulse
```

*   *Note*: This process zips your code, uploads it, builds the container remotely using the `Dockerfile`, and stores it. It takes ~2-5 minutes.

### Step 2: Deploy to Cloud Run

Deploy the container to Cloud Run. **This is where you set the API Key.**

**Option A: Using the Command Line (Recommended)**

```bash
gcloud run deploy gcp-pulse-service \
  --image gcr.io/YOUR_PROJECT_ID/gcp-pulse \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

**Option B: Using Google Secret Manager (More Secure)**

1.  Create a secret named `gemini-api-key` in Secret Manager.
2.  Deploy using the secret:

```bash
gcloud run deploy gcp-pulse-service \
  --image gcr.io/YOUR_PROJECT_ID/gcp-pulse \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

### Step 3: Verify Deployment

1.  After the deployment command finishes, it will output a **Service URL** (e.g., `https://gcp-pulse-service-uc.a.run.app`).
2.  Open this URL in your browser.
3.  **Check the Debug Console**:
    *   Press `Ctrl + ~` (Control + Tilde) to open the built-in Debug Console.
    *   Go to the **System** tab.
    *   Verify that **API Key Present** says **"Yes"** (in green).

## 🛠️ Troubleshooting

### "API key is missing" Error
If you see this error in the app:
1.  Go to the [Cloud Run Console](https://console.cloud.google.com/run).
2.  Click on your service (`gcp-pulse-service`).
3.  Click **Edit & Deploy New Revision**.
4.  Go to the **Variables & Secrets** tab.
5.  Ensure `GEMINI_API_KEY` is listed under "Environment variables" and has the correct value.
6.  Click **Deploy** to update.

### 500 Error / Crash on Start
*   Check Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gcp-pulse-service" --limit 20`
*   Ensure the container listens on port 3000 (the default) or that the `PORT` env var is set correctly (Cloud Run sets this automatically to 8080, and our `server.ts` respects it).

### 429 Quota Exceeded
*   This means you've hit the rate limit for the Gemini API.
*   The app handles this gracefully with retries, but you may need to upgrade your Gemini API plan if you have many users.


