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

### 1. Get an API Key
If you don't have one yet, get a free API key from Google AI Studio:
👉 **[Get API Key](https://aistudio.google.com/app/apikey)**

### 2. How to Provide the Key
You must provide this key as an environment variable named **`GEMINI_API_KEY`** when running the container.

---

## ⚡ Quick Start: CLI Deployment with Secrets (Recommended)

Follow these commands to securely deploy your app using Google Secret Manager.

### 1. Setup Environment Variables
```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export API_KEY="your-gemini-api-key"
export SERVICE_NAME="gcp-pulse-service"

gcloud config set project $PROJECT_ID
```

### 2. Enable Required APIs
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. Create the Secret
Store your API key securely in Secret Manager.
```bash
printf "$API_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

### 4. Build the Container
Build the Docker image using Cloud Build.
```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/gcp-pulse
```

### 5. Grant Access to the Secret
Allow the Cloud Run service account to access the secret.
```bash
# Get the default Compute Engine service account (used by Cloud Run by default)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Grant the 'Secret Accessor' role
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
```

### 6. Deploy to Cloud Run
Deploy the service and inject the secret as an environment variable.
```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/gcp-pulse \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

---

## 🐳 Local Docker Testing (Optional)

Before deploying to the cloud, you can test the production build locally using Docker.

1.  **Build the Image**:
    ```bash
    docker build -t gcp-pulse .
    ```

2.  **Run the Container**:
    Replace `your_key_here` with your actual API key.
    ```bash
    docker run -p 3000:3000 -e GEMINI_API_KEY="your_key_here" gcp-pulse
    ```

3.  **Access the App**:
    Open `http://localhost:3000`.

---

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


