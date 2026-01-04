# Deployment Guide: GCP Pulse

This guide provides step-by-step instructions for deploying the GCP Pulse application to **Google Cloud Run**.

It uses **Google Cloud Build** to build the Docker container and bake in the API key, ensuring a smooth deployment.

## 📋 Prerequisites

1.  **Google Cloud Project**: Create one at [console.cloud.google.com](https://console.cloud.google.com/).
2.  **Billing Enabled**: Ensure billing is active for your project.
3.  **Google Cloud SDK (gcloud)**: Installed and authenticated.
    *   Run `gcloud auth login`
    *   Run `gcloud config set project YOUR_PROJECT_ID`
4.  **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🚀 Deployment Steps

Run the following commands in your terminal.

### 1. Configure Project
Replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID.

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required APIs
Enable the services needed for building and running containers.

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. Create Artifact Registry Repository
Create a Docker repository named `gcpulse` in Artifact Registry to store your container images.

```bash
gcloud artifacts repositories create gcpulse \
  --repository-format=docker \
  --location=us-central1 \
  --description="GCP Pulse Repository"
```

### 4. Configure Build File
Open `cloudbuild.yaml` and replace `YOUR_API_KEY_HERE` with your actual Gemini API Key.

```yaml
# ...
'--build-arg', 'GEMINI_API_KEY=AIzaSy...', # Your actual key
# ...
```

### 5. Build the Container
Build the Docker image using Cloud Build.

```bash
gcloud builds submit --config cloudbuild.yaml
```

*Note: This process takes ~2-5 minutes.*

### 6. Deploy to Cloud Run
Deploy the built image to Google Cloud Run.
**Replace `YOUR_PROJECT_ID` with your actual Project ID.**

```bash
gcloud run deploy gcp-pulse-service \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/gcpulse/gcp-pulse \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 7. Verify Deployment
1.  The command will output a **Service URL** (e.g., `https://gcp-pulse-service-uc.a.run.app`).
2.  Open the URL in your browser.
3.  **Verify API Key**:
    *   Press `Ctrl + ~` (Control + Tilde) to open the Debug Console.
    *   Go to the **System** tab.
    *   Check that **API Key Present** is **Yes**.

---

## 🐳 Local Testing (Optional)

You can build and run the container locally to verify everything before deploying.

```bash
# Build the image locally, passing the build argument
docker build -f Dockerfile1.txt -t gcp-pulse --build-arg GEMINI_API_KEY="$API_KEY" .

# Run the container
docker run -p 3000:3000 gcp-pulse
```

Access the app at `http://localhost:3000`.

---

## 🛠️ Troubleshooting

### "API key is missing"
*   **Cause**: The API key wasn't passed correctly during the build.
*   **Fix**: Ensure the `API_KEY` variable was set in step 1, and that you ran the `gcloud builds submit` command exactly as shown in step 3.

### 500 Error / Crash on Start
*   **Check Logs**:
    ```bash
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit 20
    ```
*   **Port Issue**: Ensure the container listens on port 3000. Cloud Run automatically sets the `PORT` env var to 8080, and our `server.ts` is configured to listen on `process.env.PORT`.

### 429 Quota Exceeded
*   **Cause**: You hit the Gemini API rate limit.
*   **Fix**: Wait a moment or upgrade your API plan. The app handles this gracefully.
