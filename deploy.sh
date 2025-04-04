#!/bin/bash

# Build the application
npm run build

# Create a .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
touch dist/.nojekyll

# If you're using a custom domain for GitHub Pages, uncomment the next line and add your domain
# echo "yourdomain.com" > dist/CNAME

# Initialize Git if not already initialized
if [ ! -d ".git" ]; then
  git init
  git config user.name "GitHub Actions"
  git config user.email "actions@github.com"
fi

# Add all files to git
git add dist

# Commit changes
git commit -m "Deploy to GitHub Pages"

# If you're using a specific branch for GitHub Pages (e.g., gh-pages), uncomment and adjust the following lines
# git branch -D gh-pages || true
# git subtree split --prefix dist -b gh-pages
# git push -f origin gh-pages

# For a simpler approach, if you're deploying directly to main branch, use:
git push -f origin main

echo "Deployment complete!"