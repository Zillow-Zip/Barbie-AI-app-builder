# Automatic Render Deployment Setup

This guide explains how to set up automatic deployment to Render using GitHub Actions.

## What This Does

Every time you push code to the `main` branch, GitHub Actions will automatically trigger a new deployment on Render.

## Setup Instructions

### Step 1: Get Your Render API Key

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click your profile icon (top right)
3. Select **Account Settings**
4. Scroll to **API Keys**
5. Click **Create API Key**
6. Copy the API key (save it somewhere safe)

### Step 2: Get Your Render Service ID

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **barbie-ai-app-builder** service
3. Look at the URL: `https://dashboard.render.com/services/srv_xxxxxxxxxxxxx`
4. Copy the service ID (the part after `/services/`)

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository: `https://github.com/Zillow-Zip/Barbie-AI-app-builder`
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add two secrets:

   **Secret 1:**
   - Name: `RENDER_API_KEY`
   - Value: (paste your Render API key from Step 1)
   - Click **Add secret**

   **Secret 2:**
   - Name: `RENDER_SERVICE_ID`
   - Value: (paste your service ID from Step 2)
   - Click **Add secret**

### Step 4: Test the Workflow

1. Make a small change to your code (e.g., update README.md)
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test auto-deploy workflow"
   git push origin main
   ```
3. Go to your GitHub repository
4. Click **Actions** tab
5. You should see "Deploy to Render" workflow running
6. Wait for it to complete (usually 1-2 minutes)
7. Check your Render dashboard to see the deployment

## How It Works

The workflow file (`.github/workflows/deploy-render.yml`) does the following:

1. **Triggers on push to main** - Automatically runs when you push code
2. **Calls Render API** - Sends a deployment request to Render
3. **Monitors deployment** - Waits for the deployment to start
4. **Provides feedback** - Shows deployment status

## Manual Deployment

If you want to deploy without pushing code, you can manually trigger the workflow:

1. Go to **Actions** tab in GitHub
2. Click **Deploy to Render** workflow
3. Click **Run workflow** button
4. Select **main** branch
5. Click **Run workflow**

## Troubleshooting

### Workflow fails with "Unauthorized"
- Check that your `RENDER_API_KEY` is correct
- Make sure the secret is named exactly `RENDER_API_KEY`
- Regenerate the API key in Render if needed

### Workflow fails with "Service not found"
- Check that your `RENDER_SERVICE_ID` is correct
- Make sure the secret is named exactly `RENDER_SERVICE_ID`
- Verify the service ID matches your Render service

### Deployment doesn't start
- Check the GitHub Actions logs for error messages
- Verify both secrets are set correctly
- Try manually triggering the workflow

### Deployment succeeds but app doesn't update
- Wait 2-3 minutes for Render to finish deploying
- Check Render dashboard for any build errors
- Verify the build command is correct: `npm install --legacy-peer-deps && npm run build`
- Verify the start command is correct: `npm start`

## Disabling Auto-Deploy

To disable automatic deployments:

1. Go to `.github/workflows/deploy-render.yml`
2. Change the `on:` section to:
   ```yaml
   on:
     workflow_dispatch:
   ```
3. This will only allow manual deployments

## Monitoring Deployments

- **GitHub**: Check the **Actions** tab to see workflow status
- **Render**: Go to your service dashboard to see deployment logs
- **Your App**: Visit your Render URL to see the live app

## Support

For issues:
1. Check GitHub Actions logs for error messages
2. Check Render deployment logs
3. Verify all secrets are set correctly
4. Ensure your build and start commands are correct
