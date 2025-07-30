#!/bin/bash

# Auto-deployment script for Edumynt
# This script builds and deploys the site automatically

set -e  # Exit on any error

REPO_DIR="/home/ubuntu/astroedumynt"
DEPLOY_PATH="/var/www/edumynt"

echo "🚀 Auto-deployment started at $(date)"

cd "$REPO_DIR"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the site
echo "🔨 Building site..."
npm run build

# Deploy to web directory
echo "🚀 Deploying..."
sudo rm -rf "$DEPLOY_PATH"/*
sudo cp -r dist/* "$DEPLOY_PATH/"
sudo chown -R www-data:www-data "$DEPLOY_PATH"
sudo chmod -R 755 "$DEPLOY_PATH"

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment completed at $(date)"
echo "🌐 Site is live at https://edumynt.in"