# GatherTube for Firefox - Installation & Usage

<div align="center">
  <img src="icons/logo2.png" alt="GatherTube Logo" width="128" height="128">
</div>

## 🦊 Firefox Support

GatherTube now supports **Mozilla Firefox** with full cross-browser compatibility! This Firefox version provides the same powerful functionality as the Chrome version.

## 🚀 Features

All the same great features from the Chrome version:
- ✅ **YouTube Native Mode** - Uses Firefox's native YouTube playlist support
- ✅ **Embedded Player Mode** - Custom player with advanced controls
- ✅ **6 Video Sorting Options** - Newest, oldest, English/non-English, left-right, right-left
- ✅ **Per-Window Isolation** - Each Firefox window has independent video queues
- ✅ **Keyboard Shortcuts** - Navigate with hotkeys
- ✅ **Dark Mode Interface** - Consistent dark theme
- ✅ **Drag & Drop Reordering** - Rearrange your video queue
- ✅ **Settings Persistence** - Remembers your preferences

## 📦 Firefox Installation

### Method 1: Load Temporary Add-on (Development/Testing)

1. **Download the Firefox Files**
   ```bash
   git clone https://github.com/karimelgazar/gathertube.git
   cd gathertube
   git checkout firefox-support
   ```

2. **Open Firefox Developer Tools**
   - Go to `about:debugging` in Firefox
   - Click "This Firefox" in the left sidebar
   - Click "Load Temporary Add-on..."

3. **Load the Extension**
   - Navigate to the extension folder
   - Select the `manifest-firefox.json` file
   - Click "Open"

4. **Verify Installation**
   - The GatherTube icon should appear in the Firefox toolbar
   - Click it to test the popup

### Method 2: Create Firefox Add-on Package (Advanced)

1. **Prepare Firefox Package**
   - Copy all files to a new directory
   - Rename `manifest-firefox.json` to `manifest.json`
   - Replace JS files with Firefox versions:
     - `background-firefox.js` → `background.js`
     - `popup-firefox.js` → `popup.js`
     - `options-firefox.js` → `options.js`
     - `embed_page-firefox.js` → `embed_page.js`
     - `popup-firefox.html` → `popup.html`

2. **Package the Extension**
   ```bash
   zip -r gathertube-firefox.zip * -x "*.git*" "*chrome*" "*README*"
   ```

3. **Install in Firefox**
   - Go to `about:addons`
   - Click the gear icon → "Install Add-on From File..."
   - Select your `gathertube-firefox.zip` file

## 🎯 Usage (Same as Chrome)

### Quick Start

1. **Open YouTube Videos**
   - Open multiple YouTube videos in separate Firefox tabs
   - Each tab should contain a video (not playlists or channel pages)

2. **Gather Videos**
   - Click the GatherTube extension icon in Firefox toolbar
   - Click the "Gather YT Videos" button
   - Choose your preferred mode

3. **Enjoy Your Queue**
   - Videos will open in a single tab/player
   - Use playlist controls to manage your queue

### Queue Modes

#### 1. YouTube Native Mode (Default)
- Uses Firefox's native YouTube playlist support
- Creates temporary playlists using YouTube's `watch_videos` URL format
- **Pros**: Native YouTube experience, familiar interface
- **Cons**: Limited queue management, temporary playlists

#### 2. Embedded Player Mode
- Custom player using YouTube IFrame API
- Full playlist management with drag & drop
- **Pros**: Advanced controls, persistent queues, better management
- **Cons**: Custom interface (not native YouTube)

## 🔧 Technical Details - Firefox Specific

### Firefox Compatibility Features
- **Manifest V2**: Uses Firefox's stable extension format
- **WebExtensions API**: Uses `browser.*` APIs with `chrome.*` fallback
- **Background Script**: Traditional background script instead of service worker
- **Cross-browser Code**: Automatically detects Firefox vs Chrome APIs

### File Structure (Firefox Version)
```
gathertube-firefox/
├── manifest-firefox.json     # Firefox Manifest V2
├── background-firefox.js     # Firefox background script
├── popup-firefox.html/js     # Firefox popup interface
├── options-firefox.js        # Firefox settings page
├── embed_page-firefox.js     # Firefox video player
├── popup.css / embed_page.css # Shared CSS (same as Chrome)
├── icons/                    # Extension icons
└── README-FIREFOX.md        # This file
```

### Browser Detection
The extension automatically detects Firefox and uses appropriate APIs:

```javascript
// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
```

## 🐛 Firefox-Specific Troubleshooting

### Extension Not Loading
1. Make sure you selected the correct manifest file (`manifest-firefox.json`)
2. Check Firefox Developer Console for errors (`Ctrl+Shift+I`)
3. Ensure all Firefox-specific files are present
4. Try reloading the temporary add-on in `about:debugging`

### No Videos Found
- Same troubleshooting as Chrome version
- Ensure YouTube tabs are not in Private Browsing mode
- Check that URLs are actual video URLs, not playlists

### Embedded Player Issues (Firefox)
- Firefox may have stricter security policies than Chrome
- Check Firefox's Enhanced Tracking Protection settings
- Allow iframe loading for extension pages
- Clear Firefox cache and cookies

### Permissions Issues
- Firefox may prompt for permissions differently than Chrome
- Make sure to allow all requested permissions during installation
- Check `about:addons` → GatherTube → Permissions

## 🔄 Switching Between Chrome and Firefox

The extension maintains separate storage for each browser, so you can use both:

- **Chrome version** uses Chrome extension APIs and Manifest V3
- **Firefox version** uses WebExtensions APIs and Manifest V2
- Settings and queues are separate between browsers
- Both versions have identical functionality

## 🆕 What's Different from Chrome Version?

### Technical Differences:
- Uses Manifest V2 (more stable in Firefox)
- Background script instead of service worker
- `browser.*` APIs with `chrome.*` fallback
- Slightly different permission handling

### User Experience:
- **Identical interface and functionality**
- **Same keyboard shortcuts and features**
- **Same video sorting and queue management**
- **Same dark mode and responsive design**

## 📊 Browser Support Matrix

| Feature | Chrome | Firefox | Notes |
|---------|--------|---------|--------|
| YouTube Native Mode | ✅ | ✅ | Full support |
| Embedded Player | ✅ | ✅ | Full support |
| Video Sorting (6 options) | ✅ | ✅ | Identical |
| Per-Window Isolation | ✅ | ✅ | Full support |
| Keyboard Shortcuts | ✅ | ✅ | Identical |
| Dark Mode | ✅ | ✅ | Identical |
| Settings Persistence | ✅ | ✅ | Full support |

## 🔮 Future Firefox Updates

- **Firefox Add-ons Store**: Planning to submit to Mozilla Add-ons
- **Manifest V3**: Will migrate when Firefox fully supports it
- **Enhanced Features**: Firefox-specific optimizations
- **Performance**: Ongoing improvements for Firefox compatibility

---

**Note**: This Firefox version is fully functional and tested. If you encounter any Firefox-specific issues, please report them on the GitHub repository with the `firefox` label.