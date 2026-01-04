# GCP Info Panel & Executive Briefing

A real-time dashboard for Google Cloud Platform updates, incidents, and executive briefings, powered by the Gemini API.

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   A Google Cloud Project with the **Gemini API** enabled.
*   A valid **Gemini API Key**. [Get one here](https://aistudio.google.com/app/apikey).

### Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Environment Variable:**
    You must provide your Gemini API key. You can do this by setting the `GEMINI_API_KEY` environment variable in your shell before running the app.

    **Mac/Linux:**
    ```bash
    export GEMINI_API_KEY="your_api_key_here"
    npm run dev
    ```

    **Windows (PowerShell):**
    ```powershell
    $env:GEMINI_API_KEY="your_api_key_here"
    npm run dev
    ```

3.  **Open the App:**
    Navigate to `http://localhost:3000`.

## 📦 Deployment

This application is designed to be containerized and deployed to platforms like **Google Cloud Run**.

### 1. Build the Application

The application uses a hybrid approach:
*   **Frontend:** Built with Vite (`npm run build`) -> outputs to `dist/`
*   **Backend:** Express server (`server.ts`) that serves the static files and proxies API requests.

### 2. Docker Deployment

Create a `Dockerfile` (if not already present) or use the following instructions.

**Running with Docker:**

You must pass the `GEMINI_API_KEY` as an environment variable to the container.

```bash
docker build -t gcp-info-panel .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key_here" gcp-info-panel
```

### 3. Google Cloud Run Deployment

1.  **Build and Push the Container:**
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT_ID/gcp-info-panel
    ```

2.  **Deploy to Cloud Run:**
    You can set the environment variable during deployment.

    ```bash
    gcloud run deploy gcp-info-panel \
      --image gcr.io/PROJECT_ID/gcp-info-panel \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars GEMINI_API_KEY="your_api_key_here"
    ```

    *Alternatively, use Google Secret Manager for better security:*
    ```bash
    gcloud run deploy gcp-info-panel \
      --image gcr.io/PROJECT_ID/gcp-info-panel \
      --set-secrets GEMINI_API_KEY=my-gemini-secret:latest
    ```

## 🔑 Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API Key. Used for generating summaries and the chat assistant. | **Yes** |
| `PORT` | Port for the server to listen on (default: 3000). | No |
| `NODE_ENV` | Set to `production` for production builds. | No |

## 🛠️ Troubleshooting

*   **"API key is missing"**: Ensure the `GEMINI_API_KEY` environment variable is correctly set in your deployment environment (e.g., Cloud Run Console > Edit & Deploy > Variables).
*   **Quota Exceeded**: If you see 429 errors, you have hit the Gemini API rate limit. The app handles this gracefully, but you may need to upgrade your plan or wait.
*   **Debug Console**: Press `Ctrl + ~` (Control + Tilde) to open the built-in DevOps debug console to inspect logs and network requests in production.
