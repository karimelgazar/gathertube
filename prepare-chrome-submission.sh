#!/bin/bash

# GatherTube Chrome Web Store Submission Preparation Script
# This script prepares the Chrome extension for Chrome Web Store submission

set -e

echo "🌐 GatherTube Chrome Web Store Submission Preparation"
echo "==================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found!"
    echo "Please run this script from the project root directory (not firefox-build)."${NC}
    exit 1
fi

echo -e "${BLUE}📁 Checking Chrome extension files..."${NC}

# List the root directory contents
ls -la

echo -e "${BLUE}📋 Validating required files..."${NC}

# Check required files for Chrome
REQUIRED_FILES=(
    "manifest.json"
    "background.js"
    "popup.html"
    "popup.js"
    "options.html"
    "options.js"
    "embed_page.html"
    "embed_page.js"
    "icons"
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

# Check manifest.json syntax and version
if jq empty manifest.json 2>/dev/null; then
    echo -e "${GREEN}✅ manifest.json is valid JSON"${NC}
else
    echo -e "${RED}❌ manifest.json has invalid JSON syntax"${NC}
    exit 1
fi

# Check if it's Manifest V3
MANIFEST_VERSION=$(jq -r '.manifest_version' manifest.json)
if [ "$MANIFEST_VERSION" == "3" ]; then
    echo -e "${GREEN}✅ Using Manifest V3 (Chrome Web Store compatible)"${NC}
else
    echo -e "${RED}❌ Manifest version is $MANIFEST_VERSION, Chrome Web Store requires V3"${NC}
    exit 1
fi

# Extract version from manifest
VERSION=$(jq -r '.version' manifest.json)
echo -e "${BLUE}📦 Extension version: ${VERSION}"${NC}

# Check for service worker (Manifest V3 requirement)
SERVICE_WORKER=$(jq -r '.background.service_worker' manifest.json 2>/dev/null || echo "null")
if [ "$SERVICE_WORKER" != "null" ]; then
    echo -e "${GREEN}✅ Service worker configured: $SERVICE_WORKER"${NC}
else
    echo -e "${RED}❌ No service worker found - required for Manifest V3"${NC}
    exit 1
fi

# Check file sizes
echo -e "${BLUE}📊 Checking file sizes..."${NC}

# Check if any files are too large
find . -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.json" | while read file; do
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    if [ $size -gt 1048576 ]; then  # 1MB
        echo -e "${YELLOW}⚠️  Large file: $file ($(du -h "$file" | cut -f1))"${NC}
    fi
done

# Total size check (excluding firefox-build and other non-essential directories)
TOTAL_SIZE=$(du -sh . --exclude=firefox-build --exclude=dist --exclude=.git | cut -f1)
echo -e "${GREEN}📦 Total package size: ${TOTAL_SIZE}"${NC}

echo -e "${BLUE}🗜️  Creating Chrome Web Store package..."${NC}

# Create output directory
mkdir -p dist

# Create the ZIP package for Chrome (from root directory, excluding Firefox and other files)
zip -r "dist/gathertube-chrome-v${VERSION}.zip" \
    manifest.json \
    background.js \
    popup.html popup.js popup.css \
    options.html options.js \
    embed_page.html embed_page.js embed_page.css \
    icons/ \
    -x "firefox-build/*" "dist/*" "*.md" "*.sh" "*.git*" "*~" "*.tmp" "*.DS_Store"

# Check the created package
PACKAGE_PATH="dist/gathertube-chrome-v${VERSION}.zip"
PACKAGE_SIZE=$(du -h "$PACKAGE_PATH" | cut -f1)

echo -e "${GREEN}✅ Package created: ${PACKAGE_PATH} (${PACKAGE_SIZE})"${NC}

# List package contents
echo -e "${BLUE}📋 Package contents:"${NC}
unzip -l "$PACKAGE_PATH"

# Validate the package
echo -e "${BLUE}🔍 Package validation..."${NC}

# Check if manifest is in the package
if unzip -l "$PACKAGE_PATH" | grep -q "manifest.json"; then
    echo -e "${GREEN}✅ manifest.json included in package"${NC}
else
    echo -e "${RED}❌ manifest.json missing from package"${NC}
fi

# Check if icons are included
if unzip -l "$PACKAGE_PATH" | grep -q "icons/"; then
    echo -e "${GREEN}✅ Icons directory included in package"${NC}
else
    echo -e "${RED}❌ Icons directory missing from package"${NC}
fi

echo ""
echo -e "${GREEN}🎉 Chrome Web Store submission package ready!"${NC}
echo ""
echo -e "${YELLOW}💰 IMPORTANT: Chrome Web Store requires a $5 developer fee"${NC}
echo -e "${YELLOW}📋 Next steps for Chrome Web Store submission:"${NC}
echo "1. Go to https://chrome.google.com/webstore/devconsole/"
echo "2. Sign in with your Google account"
echo "3. Pay the \$5 developer registration fee (one-time)"
echo "4. Click 'Add new item'"
echo "5. Upload: $PACKAGE_PATH"
echo "6. Fill out the listing information (see CHROME-STORE-SUBMISSION-GUIDE.md)"
echo "7. Add screenshots (1280x800 recommended)"
echo "8. Submit for review"
echo ""
echo -e "${BLUE}📄 Complete store listing details are documented in:"${NC}
echo "   CHROME-STORE-SUBMISSION-GUIDE.md"
echo ""
echo -e "${BLUE}📊 Key differences from Firefox:"${NC}
echo "   • Uses Manifest V3 (not V2)"
echo "   • Service worker (not background script)"
echo "   • Different category system (Productivity vs Tabs/Photos)"
echo "   • \$5 developer fee required"
echo "   • Different review process (3-7 days typical)"
echo ""
echo -e "${GREEN}✅ All ready for Chrome Web Store submission!"${NC}