# 🦊 Firefox Installation Guide

## Quick Install Steps

1. **Open Firefox**

2. **Go to Firefox Add-ons Debug Page**
   - Type `about:debugging` in Firefox address bar
   - Press Enter

3. **Load Temporary Add-on**
   - Click "This Firefox" in the left sidebar
   - Click "Load Temporary Add-on..." button

4. **Select Extension Files**
   - Navigate to the `firefox-build/` folder in this repository
   - Select the `manifest.json` file
   - Click "Open"

5. **Verify Installation**
   - You should see "GatherTube - YouTube Queue Builder" in the list
   - The GatherTube icon should appear in Firefox toolbar
   - Click the icon to test the popup

## 📂 Firefox Build Structure

The `firefox-build/` directory contains:
```
firefox-build/
├── manifest.json         # Firefox Manifest V2
├── background.js         # Firefox background script  
├── popup.html           # Extension popup
├── popup.js            # Popup functionality
├── options.html        # Settings page
├── options.js         # Settings functionality
├── embed_page.html    # Video player page
├── embed_page.js     # Video player functionality
├── *.css            # Styling files
└── icons/          # Extension icons
```

## ✅ What Should Work

After installation, you should be able to:

1. **Click the GatherTube icon** in Firefox toolbar
2. **See the popup** with toggle switches and settings
3. **Open YouTube videos** in multiple tabs
4. **Click "Gather YT Videos"** to create queues
5. **Use both YouTube Native and Embedded Player modes**
6. **Access Settings** via the popup footer link

## 🐛 Troubleshooting

### Extension Not Loading
- Make sure you selected the `manifest.json` file from `firefox-build/` directory
- Check Firefox Developer Console (F12) for errors
- Try refreshing the temporary add-on in `about:debugging`

### No Videos Found
- Make sure you have YouTube video tabs open (not playlists)
- Ensure videos are in the same Firefox window
- Check that URLs contain `/watch?v=` or are `youtu.be/` links

### Permission Issues
- Allow all permissions when Firefox prompts
- Check that YouTube tabs are not in Private Browsing mode
- Make sure Firefox hasn't blocked the extension

## 🔄 Reloading During Development

If you make changes to the extension files:
1. Go to `about:debugging`
2. Find GatherTube in the list
3. Click "Reload" button
4. Test your changes

## 📦 Creating Permanent Install Package

To create a permanent Firefox add-on:
1. Zip the entire `firefox-build/` directory
2. Go to `about:addons` in Firefox  
3. Click gear icon → "Install Add-on From File..."
4. Select your zip file

---

**Ready to use!** The Firefox version has identical functionality to the Chrome version.