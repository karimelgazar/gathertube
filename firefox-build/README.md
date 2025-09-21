# GatherTube for Firefox

<div align="center">
  <img src="icons/logo.png" alt="GatherTube Logo" width="128" height="128">
</div>

## 🦊 Firefox Add-on Version

This directory contains the complete **Firefox-compatible version** of GatherTube, ready for Mozilla Add-on store (AMO) submission.

## 📦 What's Included

This Firefox build contains:

```
firefox-build/
├── manifest.json         # Firefox Manifest V2 configuration
├── background.js         # Background script (WebExtensions API)
├── popup.html           # Extension popup interface
├── popup.js            # Popup functionality (cross-browser)
├── options.html        # Settings page
├── options.js         # Settings functionality (cross-browser)
├── embed_page.html    # Video player page
├── embed_page.js     # Video player (cross-browser)
├── *.css            # Styling files
├── icons/          # Extension icons (all sizes)
└── README.md      # This file
```

## 🚀 Quick Installation (Temporary Add-on)

1. **Open Firefox** and navigate to `about:debugging`
2. **Click "This Firefox"** in the left sidebar
3. **Click "Load Temporary Add-on..."**
4. **Select `manifest.json`** from this directory
5. **Done!** The extension is now loaded

## 🏪 Mozilla Add-on Store Submission

This build is prepared for submission to the Mozilla Add-on store following AMO guidelines:

### ✅ **Compliance Checklist**

- ✅ **Manifest V2**: Uses Firefox's stable extension format
- ✅ **WebExtensions API**: Cross-browser compatible APIs
- ✅ **File Size**: Under 200 MB limit (actual: ~50 KB)
- ✅ **No Obfuscated Code**: Clean, readable JavaScript
- ✅ **Privacy Compliant**: No data transmission, local storage only
- ✅ **Add-on Policies**: Follows Mozilla's guidelines
- ✅ **Functional Testing**: Fully tested in Firefox

### 📋 **Store Listing Information**

**Name**: GatherTube - YouTube Queue Builder
**Category**: Productivity, Media
**Summary**: Gather all open YouTube video tabs into a single organized queue for seamless watching
**Description**: 
```
GatherTube is a powerful Firefox extension that helps you organize your YouTube viewing experience by gathering all open YouTube video tabs into a single, manageable queue.

Features:
• Two Queue Modes: YouTube Native playlists or custom embedded player
• Smart Video Sorting: 6 sorting options (newest, oldest, English/non-English, tab order)
• Per-Window Isolation: Independent queues for each Firefox window
• Advanced Controls: Drag & drop reordering, keyboard shortcuts
• Dark Mode Interface: Consistent dark theme across all pages
• Queue Management: Add, remove, shuffle, and persist video queues

Perfect for:
- Research sessions with multiple YouTube videos
- Educational content organization
- Entertainment playlist creation
- Streamlined video consumption

Privacy-focused: All data stored locally, no external servers or tracking.
```

**Tags**: youtube, playlist, video, queue, tabs, productivity, organization
**Support**: GitHub repository with issues tracker
**License**: MIT License

### 🔧 **Technical Details**

- **Permissions**: `tabs`, `storage`, `*://*.youtube.com/*`, `*://*.youtu.be/*`
- **Background**: Non-persistent background script
- **Content Security Policy**: Default secure policy
- **Update URL**: Not required (AMO handles updates)
- **Minimum Firefox Version**: 57.0 (WebExtensions support)

### 📄 **Required Files for Submission**

1. **Extension Package**: ZIP file containing all files in this directory
2. **Source Code**: Not required (no obfuscation/minification)
3. **Privacy Policy**: Not required (no data transmission)
4. **License**: MIT License included in package

### 🔐 **Security & Privacy**

- **No External Requests**: Extension works entirely offline
- **Local Storage Only**: All settings and queues stored in Firefox's local storage
- **No Tracking**: No analytics, telemetry, or user tracking
- **No Personal Data**: Extension doesn't collect personal information
- **Minimal Permissions**: Only requests necessary permissions

### 📊 **Testing Results**

- ✅ **Functional Testing**: All features working correctly
- ✅ **Performance Testing**: Lightweight and responsive
- ✅ **Security Testing**: No security vulnerabilities detected
- ✅ **Compatibility Testing**: Works across Firefox versions 57+
- ✅ **Cross-Platform**: Tested on Linux, Windows, macOS

## 🚀 **Submission Process**

1. **Create ZIP Package**:
   ```bash
   cd firefox-build
   zip -r gathertube-firefox.zip * -x "README.md"
   ```

2. **Go to AMO Developer Hub**: https://addons.mozilla.org/developers/
3. **Create Mozilla Account** (if needed)
4. **Submit New Add-on**
5. **Upload ZIP file**
6. **Fill out listing information**
7. **Submit for review**

## 🎯 **Version History**

- **v1.0.0**: Initial Firefox release
  - Complete feature parity with Chrome version
  - Firefox-specific optimizations
  - Cross-browser API compatibility

## 🔄 **Updates**

Future updates will be distributed through:
- Mozilla Add-on store (automatic updates)
- GitHub releases (manual installation)
- Direct developer distribution

## 📞 **Support**

- **Issues**: GitHub Issues tracker
- **Documentation**: Main repository README
- **Contact**: Repository maintainers

---

**This Firefox build provides identical functionality to the Chrome version while following Firefox's extension guidelines and best practices.**
