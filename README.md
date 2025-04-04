# V3.Game Clone

A web-based color/number prediction game with betting mechanics, timer-based rounds, and wallet functionality.

## Features

- Color prediction (Green, Violet, Red)
- Number prediction (0-9)
- Big/Small prediction (0-4 for Small, 5-9 for Big)
- 60-second game rounds with live timer
- Betting system with different payout multipliers
- Wallet functionality with deposit/withdraw options
- Real-time updates via WebSockets
- Persistent storage with PostgreSQL database

## Deployment to GitHub Pages

This application requires both a frontend and backend to function properly. For GitHub Pages deployment:

1. Create a repository on GitHub
2. Push this codebase to your repository
3. Set up a PostgreSQL database (on a service like Render, Railway, or Neon)
4. Add your `DATABASE_URL` as a repository secret in GitHub
5. Create a GitHub Actions workflow for deployment
6. Configure GitHub Pages to deploy from your chosen branch

### Sample GitHub Actions Workflow

Create a `.github/workflows/deploy.yml` file with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # Set to your main branch name

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist  # The folder the action should deploy
          branch: gh-pages  # The branch the action should deploy to
```

## Backend Deployment Options

For the backend server, you'll need to deploy it to a hosting platform that supports Node.js:

- Render
- Railway
- Heroku
- Fly.io
- Digital Ocean App Platform

Make sure to set up the same PostgreSQL database connection for both frontend and backend.

## Environment Variables

- `DATABASE_URL`: Connection string for your PostgreSQL database

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```