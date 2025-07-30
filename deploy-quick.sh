#!/bin/bash

# Quick deployment script
echo "🚀 Deploying latest changes..."

# Pull latest changes (if using git)
git pull origin main 2>/dev/null || echo "No git remote configured"

# Run deployment
./deploy-local.sh

echo "✅ Deployment complete!"