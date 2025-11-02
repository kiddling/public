#!/bin/bash

# PWA Icon Generator Script
# Usage: ./scripts/generate-pwa-icons.sh [source-image-path]
# If no source image is provided, it will use public/favicon.ico

SOURCE_IMAGE="${1:-public/favicon.ico}"
ICONS_DIR="public/icons"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image '$SOURCE_IMAGE' not found."
    echo "Usage: ./scripts/generate-pwa-icons.sh [source-image-path]"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install it with: sudo apt-get install imagemagick"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

echo "Generating PWA icons from $SOURCE_IMAGE..."

# Generate 192x192 icon
echo "  Creating icon-192x192.png..."
convert "$SOURCE_IMAGE" -resize 192x192 "$ICONS_DIR/icon-192x192.png"

# Generate 512x512 icon
echo "  Creating icon-512x512.png..."
convert "$SOURCE_IMAGE" -resize 512x512 "$ICONS_DIR/icon-512x512.png"

# Generate Apple Touch Icon (180x180)
echo "  Creating apple-touch-icon.png..."
convert "$SOURCE_IMAGE" -resize 180x180 "$ICONS_DIR/apple-touch-icon.png"

# Generate maskable icons with padding (for better appearance)
echo "  Creating maskable-192x192.png..."
convert "$SOURCE_IMAGE" -resize 144x144 -gravity center -background white -extent 192x192 "$ICONS_DIR/maskable-192x192.png"

echo "  Creating maskable-512x512.png..."
convert "$SOURCE_IMAGE" -resize 384x384 -gravity center -background white -extent 512x512 "$ICONS_DIR/maskable-512x512.png"

echo ""
echo "✅ Icons generated successfully in $ICONS_DIR/"
echo ""
echo "Generated icons:"
ls -lh "$ICONS_DIR/"
echo ""
echo "📝 Don't forget to update nuxt.config.ts if you added new icon sizes!"
