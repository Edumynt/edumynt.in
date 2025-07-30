#!/bin/bash

# Generate PWA icons from favicon.svg
# This script creates all necessary icon sizes for PWA

# Icon sizes needed for PWA
sizes=(72 96 128 144 152 192 384 512)

echo "🎨 Generating PWA icons from favicon.svg..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    sudo apt update && sudo apt install -y imagemagick
fi

# Convert SVG to PNG icons
for size in "${sizes[@]}"; do
    echo "📱 Creating ${size}x${size} icon..."
    convert -background none -size "${size}x${size}" /home/ubuntu/astroedumynt/public/favicon.svg /home/ubuntu/astroedumynt/public/icons/icon-${size}x${size}.png
done

echo "✅ PWA icons generated successfully!"
echo "📁 Icons saved in /home/ubuntu/astroedumynt/public/icons/"