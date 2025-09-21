# GatherTube - YouTube Queue Builder

A powerful Chrome extension that gathers all open YouTube video tabs into a single, organized queue for seamless watching.
<div align="center">
  <img src="icons/logo.png" alt="GatherTube Logo" width="128" height="128">
</div>

## 🚀 Features

### Core Functionality
- **One-Click Gathering**: Instantly collect all open YouTube video tabs from current window
- **Two Queue Modes**: Choose between native YouTube playlists or custom embedded player
- **Smart Detection**: Supports both `youtube.com/watch?v=` and `youtu.be/` URL formats
- **Duplicate Removal**: Automatically removes duplicate video IDs
- **Intelligent Video Sorting**: 6 sorting options for organizing your queue

### Advanced Video Sorting
- **Newest Tabs First**: Sort by tab access time (most recent first)
- **Oldest Tabs First**: Sort by tab access time (oldest first)
- **English Videos First**: Prioritize English content using language detection
- **Non-English Videos First**: Prioritize non-English content
- **Tabs Left to Right**: Sort by browser tab position (left to right)
- **Tabs Right to Left**: Sort by browser tab position (right to left)

### Queue Management
- **Drag & Drop Reordering**: Rearrange videos in your queue
- **Individual Video Controls**: Play now, delete, or skip videos
- **Queue Persistence**: Your queue survives browser restarts
- **Shuffle Support**: Randomize your video order
- **Auto-Next Playback**: Automatically advance to next video

### User Experience
- **Keyboard Shortcuts**: Navigate quickly with hotkeys
- **Dark Mode Interface**: Consistent dark theme across all pages
- **Responsive Design**: Works on all screen sizes
- **Settings Persistence**: Remember your preferences
- **Current Window Focus**: Gathers only from active browser window

## 📦 Installation

### Chrome Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/karimelgazar/gathertube.git
   cd gathertube
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the **root extension folder** (contains `manifest.json`)

### Firefox Installation

1. **Clone Repository** (same as above)
   ```bash
   git clone https://github.com/karimelgazar/gathertube.git
   cd gathertube
   ```

2. **Load in Firefox**
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on..."
   - Navigate to the `firefox-build/` folder
   - Select the `manifest.json` file inside `firefox-build/`

3. **Detailed Firefox Guide**
   - See `INSTALL-FIREFOX.md` for complete instructions
   - Troubleshooting and permanent installation steps included

### From Browser Stores
*Coming soon - extensions will be published after testing*

## 🎯 Usage

### Quick Start

1. **Open YouTube Videos**
   - Open multiple YouTube videos in separate tabs
   - Each tab should contain a video (not playlists or channel pages)

2. **Gather Videos**
   - Click the GatherTube extension icon
   - Click the "Gather YT Videos" button
   - Choose your preferred mode (see below)

3. **Enjoy Your Queue**
   - Videos will open in a single tab/player
   - Use playlist controls to manage your queue

### Queue Modes

#### 1. YouTube Native Mode (Default)
- Uses YouTube's native `watch_videos` URL format
- Creates a temporary playlist on YouTube
- Pros: Native YouTube experience, no custom player needed
- Cons: Limited queue management, temporary playlist

#### 2. Embedded Player Mode
- Uses a custom player with YouTube IFrame API
- Full playlist management with drag & drop
- Pros: Advanced queue controls, persistent across sessions
- Cons: Custom interface (not native YouTube)

### Settings & Configuration

#### Popup Settings
- **Queue behavior**: Toggle between YouTube Native and Embedded Player modes
- **Close original tabs**: Automatically close gathered tabs
- **Video order**: Choose from 6 sorting options for organizing your queue

#### Advanced Settings
- Access via extension popup → Settings
- Set default behaviors for all options
- Configure default video sorting preference
- View extension information and queue statistics
- Reset all data and clear stored preferences

### Keyboard Shortcuts

#### In Embedded Player
- `P` - Toggle playlist panel
- `Shift + →` - Next video (navigation arrows)
- `Shift + ←` - Previous video (navigation arrows)
- `N` - Next video (letter shortcut)
- `B` - Previous video (back/letter shortcut)
- `Escape` - Close playlist panel (when open)

#### In Popup
- `Enter` - Gather videos

#### Visual Feedback
All keyboard shortcuts show visual confirmation when activated, displaying the action performed in the top-right corner of the player.

## 🌍 Browser Support

### Supported Browsers
- ✅ **Google Chrome** (Manifest V3, Service Worker)
- ✅ **Mozilla Firefox** (Manifest V2, Background Script)
- ✅ **Microsoft Edge** (Chromium-based, same as Chrome)
- ✅ **Brave Browser** (Chromium-based, same as Chrome)
- ✅ **Opera** (Chromium-based, same as Chrome)

### Cross-Browser Features
- ✅ **100% Feature Parity** - All functionality works identically
- ✅ **Independent Storage** - Settings and queues are separate per browser
- ✅ **Automatic API Detection** - Uses appropriate browser APIs
- ✅ **Same User Experience** - Identical interface and shortcuts

## ⚙️ Technical Details

### Architecture
- **Chrome**: Manifest V3 with Service Worker
- **Firefox**: Manifest V2 with Background Script 
- **Cross-Browser APIs**: Automatic `browser.*` / `chrome.*` detection
- **YouTube IFrame API**: Powers the embedded player
- **Local Storage**: Persistent settings and queue data

### Permissions Required
- `tabs` - Read tab URLs and manage tabs
- `storage` - Save user preferences and queue data
- `host_permissions` - Access YouTube domains for video detection

### File Structure
```
gathertube/
├── manifest.json          # Chrome extension configuration (Manifest V3)
├── popup.html/js/css      # Chrome extension popup interface
├── background.js          # Chrome service worker for tab operations
├── embed_page.html/js/css # Custom video player (shared)
├── options.html/js        # Chrome settings page
├── icons/                 # Extension icons (shared)
├── firefox-build/         # Complete Firefox extension directory
│   ├── manifest.json      # Firefox configuration (Manifest V2)
│   ├── background.js      # Firefox background script
│   ├── popup.html/js      # Firefox popup (cross-browser compatible)
│   ├── options.js         # Firefox settings (cross-browser compatible)
│   ├── embed_page.js      # Firefox video player (cross-browser compatible)
│   └── icons/             # Extension icons (copied)
├── INSTALL-FIREFOX.md     # Firefox installation guide
└── README.md              # This file
```

## 🔧 Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of Chrome extensions
- Text editor or IDE

### Setup Development Environment

1. **Clone Repository**
   ```bash
   git clone https://github.com/karimelgazar/gathertube.git
   cd gathertube
   ```

2. **Load Extension**
   - Follow installation instructions above
   - Enable "Developer mode" in `chrome://extensions/`

3. **Development Workflow**
   - Make changes to source files
   - Click "Reload" button in `chrome://extensions/`
   - Test functionality

### Testing
- Test with various YouTube URL formats
- Test with large numbers of videos
- Test keyboard shortcuts and UI interactions
- Test both queue modes extensively

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Working
1. Ensure Developer mode is enabled
2. Check that extension is loaded and enabled
3. Refresh the extension after code changes
4. Check browser console for errors

#### No Videos Found
- Ensure tabs contain YouTube video URLs (`youtube.com/watch?v=` or `youtu.be/`)
- Extension only gathers from current browser window (this is the default behavior)
- Check that tabs are not private/incognito (unless extension is enabled for incognito)
- Verify URLs are not playlists or channel pages

#### Embedded Player Issues
- Check internet connection
- Ensure YouTube IFrame API can load
- Clear browser cache and cookies
- Check browser console for JavaScript errors

#### URL Too Long Error
- Occurs with many videos in YouTube Native mode
- Extension automatically falls back to embedded mode
- Consider using embedded mode for large queues

### Debug Information
- Check browser console (F12 → Console)
- Enable extension error logging in `chrome://extensions/`
- Check extension storage in DevTools → Application → Storage

## 📄 Privacy Policy

GatherTube respects your privacy:
- **No Data Collection**: No personal data is sent to external servers
- **Local Storage Only**: All settings and queues stored locally
- **YouTube Integration**: Uses public YouTube APIs only
- **No Tracking**: No analytics or usage tracking

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Test thoroughly on different YouTube scenarios
- Update documentation for new features
- Ensure manifest.json follows Chrome extension best practices

