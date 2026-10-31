#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting standalone deployment build..."

# 1. Clean up old build artifacts
echo "Cleaning up old build artifacts..."
rm -rf .next
rm -f deploy.tar.gz

# 2. Run Next.js build
# Requires 'output: standalone' in next.config.ts
echo "Running npm run build..."
npm run build

# 3. Copy necessary files to standalone directory
# public and static files are not included in standalone output by default
echo "Copying public and static files..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 4. Create deployment archive
echo "Creating deployment bundle (deploy.tar.gz)..."
# Archive contents of .next/standalone into the root of the tarball
tar -czf deploy.tar.gz -C .next/standalone .

echo "--------------------------------------------------"
echo "Success! Deployment bundle created: deploy.tar.gz"
echo ""
echo "How to deploy:"
echo "1. Upload 'deploy.tar.gz' to your server."
echo "2. Extract it: tar -xzf deploy.tar.gz"
echo "3. Run the app: node server.js"
echo "   (Note: Ensure required environment variables and 'data' directory"
echo "    are set up on the server before starting)"
echo "--------------------------------------------------"
