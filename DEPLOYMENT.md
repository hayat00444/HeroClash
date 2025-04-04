# Deployment Guide for V3.Game Clone

This guide will help you deploy your V3.Game Clone application to GitHub Pages for the frontend and another host for the backend.

## Prerequisites

- GitHub account
- Node.js hosting service (Render, Railway, Heroku, etc.)
- PostgreSQL database (can be hosted on Render, Railway, Neon, etc.)

## Step 1: Prepare Your Application for Deployment

1. Build the application for production:

```bash
npm run build
```

This will create a `client/dist` directory with the built frontend assets.

## Step 2: Frontend Deployment (GitHub Pages)

1. Create a new repository on GitHub
2. Push your code to the repository
3. Create a new branch called `gh-pages`
4. Copy the contents of `client/dist` to the root of the `gh-pages` branch
5. Commit and push the changes to GitHub
6. Go to your repository settings and enable GitHub Pages
7. Select the `gh-pages` branch as the source
8. Your site will be available at `https://yourusername.github.io/repository-name/`

## Step 3: Backend Deployment

1. Deploy your Node.js backend to a service like Render or Railway
2. Make sure to set the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: Set to `production`
   - `PORT`: The port for your server (or let the platform set it)
   - `CLIENT_URL`: The URL of your frontend (GitHub Pages URL)

## Step 4: Connect Frontend to Backend

1. In your frontend code, update the API URL to point to your backend:

```typescript
// In client/src/lib/queryClient.ts
// Update to use environment variable or hardcode your backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com';
```

2. Create a `.env` file in the root of your project for local development:

```
VITE_API_URL=https://your-backend-url.com
```

## Step 5: Testing the Deployment

1. Open your GitHub Pages URL in a browser
2. Make sure it connects to your backend API
3. Try logging in, placing bets, and other application features

## Troubleshooting

If you see only text content on your GitHub Pages site:

1. Check if you properly copied all files from `client/dist` to the `gh-pages` branch
2. Make sure you have an `index.html` file at the root of your `gh-pages` branch
3. Check browser console for any CORS errors - you might need to configure CORS on your backend
4. Verify that your frontend is using the correct API URL for the backend

## Additional Notes

- For WebSocket connections, make sure to use secure WebSocket (`wss://`) when your frontend is served over HTTPS
- Consider using a custom domain for a more professional look
- Set up proper error handling and monitoring for your production deployment