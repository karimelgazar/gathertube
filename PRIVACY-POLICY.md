# Privacy Policy for GatherTube

**Last updated: September 21, 2025**

## Overview

GatherTube is a browser extension that helps users organize YouTube video tabs into a unified queue for seamless watching. We are committed to protecting your privacy and being transparent about our data practices.

## Data Collection

**GatherTube does NOT collect, store, or transmit any personal data or user information to external servers.**

This extension operates entirely within your local browser environment and does not communicate with any external services, databases, or third-party platforms except for YouTube content that you explicitly choose to interact with.

## Local Storage Only

The extension uses only local browser storage (`chrome.storage.local` or `browser.storage.local`) to save:

- **User interface preferences**: Dark mode setting, sort order preferences, view mode settings
- **Temporary video metadata**: Video titles, thumbnails, durations, and channel names for display purposes only
- **Extension settings**: YouTube viewing mode preference (Native vs Embedded player), keyboard shortcut configurations
- **Queue state**: Your organized video queue for the current browser session

**All this data remains exclusively in your local browser and is never transmitted elsewhere.**

## No Third-Party Services

GatherTube does not:

- Send data to external servers or cloud services
- Use analytics, tracking, or telemetry services
- Share information with third parties
- Connect to remote databases or APIs (except YouTube's public content)
- Include advertising networks or marketing pixels
- Use external JavaScript libraries or CDNs

## YouTube Integration

The extension accesses YouTube pages only to:

- **Read public video information**: Titles, thumbnails, durations, and channel names from YouTube pages you have open
- **Display YouTube content**: Show video thumbnails and allow embedded playback through YouTube's standard embed functionality  
- **Manage browser tabs**: Open, close, and navigate between YouTube video tabs at your request
- **Parse YouTube URLs**: Extract video IDs to organize and display your queue

**Important**: GatherTube only accesses YouTube content from tabs you already have open in your browser. It does not browse YouTube independently or access your YouTube account data, watch history, or personal information.

## Permissions Explained

### Required Permissions:

- **`tabs`**: Allows the extension to identify YouTube tabs, extract video URLs, and navigate between videos
- **`storage`**: Enables saving your preferences and settings locally in your browser
- **`https://www.youtube.com/*`** and **`https://youtu.be/*`**: Required to read video information from YouTube pages and enable embedded playback

### What We DON'T Access:

- Your YouTube account or login information
- Your YouTube viewing history or recommendations  
- Personal data from other websites
- Files or data outside of YouTube video information
- Your location, contacts, or device information

## Data Security

- All extension data remains in your local browser storage
- No data is transmitted over the internet (except standard YouTube embed functionality)
- No servers, databases, or cloud storage systems are involved
- Your data is protected by your browser's built-in security features

## Data Retention

- Settings and preferences persist until you uninstall the extension or clear your browser data
- Video metadata is cached temporarily and cleared when tabs are closed
- You can clear all extension data by removing the extension or clearing browser storage

## Your Rights

You have complete control over your data:

- **Access**: All data is stored locally and visible through browser developer tools
- **Deletion**: Uninstall the extension or clear browser data to remove all stored information
- **Control**: Modify settings and preferences at any time through the extension interface

## Children's Privacy

GatherTube does not knowingly collect or store any personal information from users of any age. The extension only processes public YouTube video information that users choose to interact with.

## Changes to This Policy

We may update this privacy policy to reflect changes in our practices or for legal compliance. Any changes will be posted in this document with an updated "Last updated" date.

## Contact Information

If you have questions about this privacy policy or GatherTube's data practices:

- **GitHub Issues**: [Open an issue on our GitHub repository](https://github.com/[YOUR_USERNAME]/gathertube-extension/issues)
- **Email**: [your-email@domain.com] (replace with your contact email)

## Compliance

This privacy policy complies with:

- Chrome Web Store Developer Program Policies
- Mozilla Add-on Policies  
- General privacy best practices for browser extensions

---

**Summary**: GatherTube is designed with privacy-first principles. We collect no personal data, use no external services, and keep everything local to your browser. Your YouTube tab organization stays between you and your browser.