# GatherTube - YouTube Queue Builder

A powerful Chrome extension that gathers all open YouTube video tabs into a single, organized queue for seamless watching.

![GatherTube Demo](docs/demo.gif)

## 🚀 Features

### Core Functionality
- **One-Click Gathering**: Instantly collect all open YouTube video tabs
- **Two Queue Modes**: Choose between native YouTube playlists or custom embedded player
- **Smart Detection**: Supports both `youtube.com/watch?v=` and `youtu.be/` URL formats
- **Duplicate Removal**: Automatically removes duplicate video IDs

### Queue Management
- **Drag & Drop Reordering**: Rearrange videos in your queue
- **Individual Video Controls**: Play now, delete, or skip videos
- **Queue Persistence**: Your queue survives browser restarts
- **Shuffle Support**: Randomize your video order

### User Experience
- **Keyboard Shortcuts**: Navigate quickly with hotkeys
- **Clean Interface**: YouTube-inspired dark theme
- **Responsive Design**: Works on all screen sizes
- **Settings Persistence**: Remember your preferences

## 📦 Installation

### From Source (Recommended for Development)

1. **Clone or Download**
   ```bash
   git clone https://github.com/your-username/gathertube.git
   cd gathertube
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the extension folder

3. **Icons Included**
   - The extension includes a custom logo and all required icon sizes
   - Icons are automatically generated from the main logo.png

### From Chrome Web Store
*Coming soon - extension will be published after testing*

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

#### 1. watch_videos Mode (Default)
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
- **Queue behavior**: Toggle between watch_videos and embedded player
- **Close original tabs**: Automatically close gathered tabs

#### Advanced Settings
- Access via extension popup → Settings
- Set default behaviors
- View extension information
- Reset all data

### Keyboard Shortcuts

#### In Embedded Player
- `P` - Toggle playlist panel
- `Shift + →` - Next video
- `Shift + ←` - Previous video
- `Escape` - Close playlist panel

#### In Popup
- `Enter` - Gather videos

## 🛠️ Technical Details

### Architecture
- **Manifest V3**: Uses modern Chrome extension APIs
- **Service Worker**: Handles background tab operations
- **YouTube IFrame API**: Powers the embedded player
- **Local Storage**: Persistent settings and queue data

### Permissions Required
- `tabs` - Read tab URLs and manage tabs
- `storage` - Save user preferences and queue data
- `host_permissions` - Access YouTube domains for video detection

### File Structure
```
gathertube/
├── manifest.json          # Extension configuration
├── popup.html/js/css      # Extension popup interface
├── background.js          # Service worker for tab operations
├── embed_page.html/js/css # Custom video player
├── options.html/js        # Settings page
├── icons/                 # Extension icons
└── README.md             # This file
```

## 🔧 Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of Chrome extensions
- Text editor or IDE

### Setup Development Environment

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/gathertube.git
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
- Check that tabs are not private/incognito (unless extension is enabled for incognito)
- Verify URLs are not playlists or channel pages

#### Embedded Player Issues
- Check internet connection
- Ensure YouTube IFrame API can load
- Clear browser cache and cookies
- Check browser console for JavaScript errors

#### URL Too Long Error
- Occurs with many videos in watch_videos mode
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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- YouTube IFrame API for embedded player functionality
- Chrome Extensions documentation and community
- YouTube for the inspiration and platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/gathertube/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/gathertube/discussions)
- **Email**: your-email@example.com

## 🔗 Links

- [Chrome Web Store](https://chrome.google.com/webstore/detail/gathertube) *(coming soon)*
- [GitHub Repository](https://github.com/your-username/gathertube)
- [Documentation](https://github.com/your-username/gathertube/wiki)

---

**Made with ❤️ for YouTube enthusiasts**