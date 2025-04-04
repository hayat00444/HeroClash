#!/bin/bash

# GitHub Pages Deployment Script for V3 Game

# Exit script if any command fails
set -e

echo "=== V3 Game GitHub Pages Deployment Script ==="
echo "This script will build and prepare your project for GitHub Pages deployment."

# Step 1: Ensure .env.production exists
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production file not found!"
  echo "Please create a .env.production file with your backend API URL:"
  echo "VITE_API_URL=https://your-backend-url.com"
  exit 1
fi

# Step 2: Build the project
echo "Building project for production..."
npm run build

# Step 3: Create a .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
echo "Creating .nojekyll file..."
touch dist/.nojekyll

# Step 4: Create a custom 404.html that redirects to index.html (for SPA routing)
echo "Creating custom 404.html for SPA routing..."
cat > dist/404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>V3 Game</title>
  <script type="text/javascript">
    // Single Page Apps for GitHub Pages
    // MIT License
    // https://github.com/rafgraph/spa-github-pages
    var pathSegmentsToKeep = 1;

    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
  Redirecting...
</body>
</html>
EOF

# Step 5: Update index.html to handle SPA routing
echo "Updating index.html for SPA routing on GitHub Pages..."
# This is a bit tricky as we need to modify the existing file
# We'll use a temporary file
index_file="dist/index.html"
temp_file="dist/index.html.tmp"

# Check if the redirect script already exists to avoid adding it multiple times
if ! grep -q "redirect script for GitHub Pages" "$index_file"; then
  # Add the redirect script right after the <head> tag
  awk '/<head>/ {
    print $0;
    print "  <!-- Single Page Apps for GitHub Pages -->";
    print "  <script type=\"text/javascript\">";
    print "    // Single Page Apps for GitHub Pages";
    print "    // MIT License";
    print "    // https://github.com/rafgraph/spa-github-pages";
    print "    (function(l) {";
    print "      if (l.search[1] === \"/\" ) {";
    print "        var decoded = l.search.slice(1).split(\"&\").map(function(s) { ";
    print "          return s.replace(/~and~/g, \"&\")";
    print "        }).join(\"?\");";
    print "        window.history.replaceState(null, null,";
    print "          l.pathname.slice(0, -1) + decoded + l.hash";
    print "        );";
    print "      }";
    print "    }(window.location))";
    print "  </script>";
    next;
  }
  { print }' "$index_file" > "$temp_file"
  
  mv "$temp_file" "$index_file"
else
  echo "SPA routing script already exists in index.html"
fi

echo "=== Deployment build complete! ==="
echo ""
echo "Your project is now ready for GitHub Pages deployment."
echo "The built files are in the 'dist' directory."
echo ""
echo "Next steps:"
echo "1. Commit these changes to your GitHub repository"
echo "2. Configure GitHub Pages in your repository settings to use the 'dist' directory"
echo ""
echo "For detailed instructions, see GITHUB_DEPLOYMENT.md"
