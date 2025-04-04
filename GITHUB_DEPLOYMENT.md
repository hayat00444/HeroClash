# Deploying V3.Game to GitHub Pages

This guide explains how to deploy your V3.Game application to GitHub Pages for free hosting.

## Prerequisites

1. A GitHub account
2. Your V3.Game project code in a GitHub repository
3. A separate server for your backend API (GitHub Pages only hosts static content)

## Setup Steps

### 1. Prepare Your Repository

If you haven't already, create a GitHub repository for your project and push your code.

### 2. Update API URLs

Before deployment, make sure to update the API URL in these files to point to your backend server:

- `play.html`: Update the `window.API_URL` value
- `admin.html`: Update the `window.API_URL` value

```javascript
window.API_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL
```

### 3. Build the Project

Run the deployment script:

```bash
./deploy.sh
```

This script:
- Builds your project
- Copies the necessary HTML files to the `dist` folder
- Prepares everything for GitHub Pages deployment

### 4. Deploy to GitHub Pages

You have two options:

#### Option A: Using GitHub Actions (Recommended)

1. Create a `.github/workflows/deploy.yml` file in your repository with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # or your default branch

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Copy deployment files
        run: |
          cp index.html dist/
          cp play.html dist/
          cp admin.html dist/
          cp 404.html dist/
          
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist
```

2. Push this file to your repository, and GitHub Actions will automatically deploy your site.

#### Option B: Manual Deployment

1. Create a branch named `gh-pages`
2. Copy the contents of your `dist` folder to this branch
3. Push the `gh-pages` branch to GitHub

### 5. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" > "Pages"
3. Under "Source", select the `gh-pages` branch
4. Click "Save"

GitHub will provide you with a URL where your site is published (typically `https://username.github.io/repository-name/`).

## Access Points

Once deployed, your V3.Game will be accessible at:

- Main Game: `https://username.github.io/repository-name/play.html`
- Admin Panel: `https://username.github.io/repository-name/admin.html`
- Default Redirect: `https://username.github.io/repository-name/` (redirects to play.html)

## Troubleshooting

- **404 Errors**: Make sure your 404.html file is properly set up in the repository root
- **API Connection Issues**: Confirm your backend server is running and the API URL is correctly set
- **Routing Problems**: GitHub Pages doesn't support server-side routing, so client-side routing (hash-based) is used

## Backend Deployment

Remember that GitHub Pages only hosts static content. You'll need to deploy your backend API separately on a server that supports Node.js applications, such as:

- Heroku
- Render
- Netlify Functions
- Vercel
- DigitalOcean

Update the `window.API_URL` in your HTML files to point to your deployed backend.
