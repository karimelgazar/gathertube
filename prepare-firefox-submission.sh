#!/bin/bash

# GatherTube Firefox Add-on Submission Preparation Script
# This script prepares the Firefox build for Mozilla Add-on store submission

set -e

echo "🦊 GatherTube Firefox Submission Preparation"
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "firefox-build" ]; then
    echo -e "${RED}❌ Error: firefox-build directory not found!"
    echo "Please run this script from the project root directory."${NC}
    exit 1
fi

echo -e "${BLUE}📁 Checking firefox-build directory..."${NC}

# List the contents
ls -la firefox-build/

echo -e "${BLUE}📋 Validating required files..."${NC}

# Check required files
REQUIRED_FILES=(
    "firefox-build/manifest.json"
    "firefox-build/background.js"
    "firefox-build/popup.html"
    "firefox-build/popup.js"
    "firefox-build/options.html"
    "firefox-build/options.js"
    "firefox-build/embed_page.html"
    "firefox-build/embed_page.js"
    "firefox-build/icons"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${GREEN}✅ $file"${NC}
    else
        echo -e "${RED}❌ Missing: $file"${NC}
        exit 1
    fi
done

echo -e "${BLUE}🔍 Validating manifest.json..."${NC}

# Check manifest.json syntax
if jq empty firefox-build/manifest.json 2>/dev/null; then
    echo -e "${GREEN}✅ manifest.json is valid JSON"${NC}
else
    echo -e "${RED}❌ manifest.json has invalid JSON syntax"${NC}
    exit 1
fi

# Extract version from manifest
VERSION=$(jq -r '.version' firefox-build/manifest.json)
echo -e "${BLUE}📦 Extension version: ${VERSION}"${NC}

# Check file sizes
echo -e "${BLUE}📊 Checking file sizes..."${NC}
TOTAL_SIZE=$(du -sh firefox-build | cut -f1)
echo -e "${GREEN}📦 Total package size: ${TOTAL_SIZE}"${NC}

# Check individual large files
find firefox-build -type f -size +1M -exec ls -lh {} \; | awk '{ print "⚠️  Large file: " $9 " (" $5 ")" }'

echo -e "${BLUE}🗜️  Creating submission package..."${NC}

# Create output directory
mkdir -p dist

# Create the ZIP package (excluding README.md and other non-essential files)
cd firefox-build
zip -r "../dist/gathertube-firefox-v${VERSION}.zip" \
    manifest.json \
    background.js \
    popup.html popup.js popup.css \
    options.html options.js \
    embed_page.html embed_page.js embed_page.css \
    icons/ \
    LICENSE \
    -x "README.md" "*.DS_Store" "*~" "*.tmp"

cd ..

# Check the created package
PACKAGE_PATH="dist/gathertube-firefox-v${VERSION}.zip"
PACKAGE_SIZE=$(du -h "$PACKAGE_PATH" | cut -f1)

echo -e "${GREEN}✅ Package created: ${PACKAGE_PATH} (${PACKAGE_SIZE})"${NC}

# List package contents
echo -e "${BLUE}📋 Package contents:"${NC}
unzip -l "$PACKAGE_PATH"

echo ""
echo -e "${GREEN}🎉 Firefox submission package ready!"${NC}
echo ""
echo -e "${YELLOW}📋 Next steps for Mozilla Add-on store submission:"${NC}
echo "1. Go to https://addons.mozilla.org/developers/"
echo "2. Create/login to your Mozilla Account"
echo "3. Click 'Submit a New Add-on'"
echo "4. Choose 'On this site' (for AMO listing)"
echo "5. Upload: $PACKAGE_PATH"
echo "6. Fill out the listing information (see firefox-build/README.md)"
echo "7. Submit for review"
echo ""
echo -e "${BLUE}📄 Store listing details are documented in:"${NC}
echo "   firefox-build/README.md"
echo ""
echo -e "${GREEN}✅ All ready for submission!"${NC}