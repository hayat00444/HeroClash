#!/bin/bash

# V3.Game GitHub Pages Deployment Script
echo "Starting V3.Game deployment process..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Build the project
echo "Building the project..."
npm run build

# Copy GitHub Pages specific files to dist
echo "Copying GitHub Pages specific files..."
cp index.html dist/
cp play.html dist/
cp admin.html dist/
cp 404.html dist/

# Copy any other necessary files
if [ -d "public" ]; then
  echo "Copying files from public folder..."
  cp -r public/* dist/
fi

echo "Deployment preparation complete!"
echo "To deploy to GitHub Pages:"
echo "1. Push the 'dist' folder to your gh-pages branch"
echo "2. OR configure your repository to deploy from the 'dist' folder"
echo ""
echo "Don't forget to update the API_URL in play.html and admin.html to point to your actual backend URL."
