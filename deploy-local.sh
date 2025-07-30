#!/bin/bash

# Local deployment script for Edumynt on Oracle VM
DEPLOY_PATH="/var/www/edumynt"

echo "🚀 Starting local deployment..."

# Build the site
echo "📦 Building the site..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create web directory if it doesn't exist
echo "📁 Preparing deployment directory..."
sudo mkdir -p $DEPLOY_PATH

# Copy built files to web directory
echo "📋 Copying files..."
sudo rm -rf $DEPLOY_PATH/*
sudo cp -r dist/* $DEPLOY_PATH/

# Set proper permissions
echo "🔧 Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_PATH
sudo chmod -R 755 $DEPLOY_PATH

# Restart nginx to ensure it picks up any changes
echo "🔄 Restarting nginx..."
sudo systemctl reload nginx

echo "✅ Deployment completed!"
echo "🌐 Your site should be live at https://edumynt.in"