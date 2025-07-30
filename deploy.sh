#!/bin/bash

# Deployment script for Edumynt to Oracle VM
# Replace the variables below with your actual server details

SERVER_IP="your.server.ip.address"
SERVER_USER="ubuntu"  # or your server username
DEPLOY_PATH="/var/www/edumynt"

echo "🚀 Starting deployment to Oracle VM..."

# Build the site
echo "📦 Building the site..."
npm run build

# Create a tarball of the dist folder
echo "📄 Creating deployment package..."
cd dist
tar -czf ../edumynt-site.tar.gz .
cd ..

# Upload to server
echo "⬆️  Uploading to server..."
scp edumynt-site.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Deploy on server
echo "🔧 Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    # Create web directory if it doesn't exist
    sudo mkdir -p /var/www/edumynt
    
    # Extract the site files
    cd /tmp
    sudo tar -xzf edumynt-site.tar.gz -C /var/www/edumynt
    
    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/edumynt
    sudo chmod -R 755 /var/www/edumynt
    
    # Clean up
    rm edumynt-site.tar.gz
    
    echo "✅ Site deployed successfully!"
EOF

# Clean up local files
rm edumynt-site.tar.gz

echo "🎉 Deployment completed!"
echo "🌐 Your site should be live at https://edumynt.in"