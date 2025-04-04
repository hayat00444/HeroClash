# GitHub Pages Deployment Guide

This document provides instructions for deploying the V3 Game application to GitHub Pages.

## Prerequisites

1. A GitHub account
2. A server to host the backend API (such as Render, Heroku, or DigitalOcean)
3. PostgreSQL database (e.g., on Neon, Supabase, or a self-hosted solution)

## Step 1: Deploy the Backend Server

Before deploying to GitHub Pages, you must first deploy the backend server:

1. Create a new server on your preferred hosting platform
2. Set up the following environment variables on your server:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CORS_ORIGIN`: The URL of your GitHub Pages site (e.g., `https://yourusername.github.io/your-repo-name`)
   - Other necessary environment variables for your application

3. Deploy the server code to your hosting platform

## Step 2: Create Production Environment File

1. Create a `.env.production` file in the root of your project (based on `.env.production.example`)
2. Set `VITE_API_URL` to your deployed backend URL, for example:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

## Step 3: Build the Frontend for Production

Run the following command to build the frontend for production:

```bash
npm run build
```

This will create a `dist` directory with the production-ready frontend files.

## Step 4: Deploy to GitHub Pages

1. Create a new GitHub repository for your project
2. Push your code to the repository
3. Set up GitHub Pages for your repository:
   - Go to the repository settings
   - Scroll down to the "GitHub Pages" section
   - Select the branch to deploy (usually `main` or `master`)
   - Select the `/dist` folder as the source
   - Save the changes

4. GitHub Pages will automatically build and deploy your site
5. Your site will be available at `https://yourusername.github.io/your-repo-name`

## Troubleshooting

### WebSocket Connection Issues

- Ensure your backend server is running and accessible
- Verify the `VITE_API_URL` in `.env.production` is correct
- Check that your server has CORS configured properly with the GitHub Pages URL

### API Connectivity Problems

- Open the browser dev tools and check for CORS errors
- Ensure your backend server is accessible from the GitHub Pages domain
- Verify the `CORS_ORIGIN` environment variable on your server matches your GitHub Pages URL

### Database Connection Issues

- Check the `DATABASE_URL` environment variable on your server
- Ensure your database is properly configured and accessible from your server

## Keeping Your Deployment Updated

When you make changes to your application:

1. Rebuild the frontend: `npm run build`
2. Push changes to your GitHub repository
3. Update your backend server if necessary
