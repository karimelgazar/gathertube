// Background Service Worker for GatherTube extension

class GatherTubeBackground {
    constructor() {
        this.MAX_URL_LENGTH = 8000; // Safe limit for watch_videos URL
        this.initializeListeners();
    }
    
    initializeListeners() {
        // Handle messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'gather') {
                this.handleGatherRequest(request, sendResponse);
                return true; // Keep message channel open for async response
            }
        });
        
        // Handle extension installation
        chrome.runtime.onInstalled.addListener(() => {
            this.setDefaultSettings();
        });
    }
    
    async setDefaultSettings() {
        const result = await chrome.storage.local.get(['embedMode', 'closeTabs', 'sortOrder']);
        if (result.embedMode === undefined || result.closeTabs === undefined || result.sortOrder === undefined) {
            await chrome.storage.local.set({
                embedMode: false,
                closeTabs: false,
                sortOrder: 'newest'
            });
        }
    }
    
    async handleGatherRequest(request, sendResponse) {
        try {
            const { embedMode, closeTabs, sortOrder } = request;
            const currentWindowOnly = true; // Always use current window only
            
            // Get all YouTube video tabs
            const videoData = await this.getYouTubeVideoTabs(currentWindowOnly);
            
            // Sort video data according to the selected sort order
            const sortedVideoData = this.sortVideoData(videoData, sortOrder || 'newest');
            
            if (sortedVideoData.length === 0) {
                sendResponse({
                    success: false,
                    message: 'No YouTube video tabs found.',
                    videoCount: 0
                });
                return;
            }
            
            // Extract video IDs and remove duplicates
            const videoIds = this.extractUniqueVideoIds(sortedVideoData);
            
            
            // Create queue based on mode
            let queueResult;
            if (embedMode) {
                queueResult = await this.createEmbeddedQueue(videoIds);
            } else {
                queueResult = await this.createWatchVideosQueue(videoIds);
            }
            
            if (!queueResult.success) {
                sendResponse(queueResult);
                return;
            }
            
            // Close original tabs if requested
            if (closeTabs) {
                await this.closeOriginalTabs(sortedVideoData, queueResult.newTabId);
            }
            
            sendResponse({
                success: true,
                message: `Successfully gathered ${videoIds.length} video(s)!`,
                videoCount: videoIds.length,
                queueUrl: queueResult.url
            });
            
        } catch (error) {
            sendResponse({
                success: false,
                message: 'Failed to gather videos: ' + error.message,
                videoCount: 0
            });
        }
    }
    
    async getYouTubeVideoTabs(currentWindowOnly = false) {
        const queryOptions = currentWindowOnly ? { currentWindow: true } : {};
        const tabs = await chrome.tabs.query(queryOptions);
        
        const youtubeTabs = tabs.filter(tab => {
            if (!tab.url && !tab.title) return false;
            
            const urlToCheck = tab.url || '';
            const titleToCheck = tab.title || '';
            
            // EXCLUDE playlist URLs explicitly
            if (urlToCheck.includes('youtube.com/playlist') || 
                urlToCheck.includes('/channel/') || 
                urlToCheck.includes('/c/') || 
                urlToCheck.includes('/user/') ||
                urlToCheck.includes('youtube.com/feed') ||
                urlToCheck.includes('youtube.com/results')) {
                return false;
            }
            
            // Only include actual VIDEO URLs
            const videoPatterns = [
                // Standard YouTube video URLs (must have v= parameter)
                /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/i,
                // YouTube live URLs
                /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
                // Short YouTube URLs
                /youtu\.be\/([a-zA-Z0-9_-]{11})/i
            ];
            
            // Check if URL matches video patterns
            const matchesVideoPattern = videoPatterns.some(pattern => pattern.test(urlToCheck));
            
            if (matchesVideoPattern) {
                // Double-check by extracting video ID
                const videoId = this.extractVideoId(urlToCheck);
                return videoId !== null;
            }
            
            // For suspended tabs or other edge cases, try title extraction
            if ((urlToCheck.includes('suspended') && urlToCheck.includes('youtube')) || 
                (titleToCheck.toLowerCase().includes('youtube'))) {
                const videoId = this.extractVideoIdFromTitle(titleToCheck);
                return videoId !== null;
            }
            
            return false;
            
        }).map(tab => ({
            id: tab.id,
            url: tab.url,
            title: tab.title || 'YouTube Video',
            index: tab.index,
            lastAccessed: tab.lastAccessed || Date.now()
        }));
        
        return youtubeTabs;
    }
    
    extractUniqueVideoIds(videoData) {
        const videoIds = new Set();
        
        videoData.forEach(video => {
            // Try to extract from URL first
            let videoId = this.extractVideoId(video.url);
            
            // If not found in URL, try title
            if (!videoId) {
                videoId = this.extractVideoIdFromTitle(video.title);
            }
            
            if (videoId) {
                videoIds.add(videoId);
            }
        });
        
        return Array.from(videoIds);
    }
    
    extractVideoId(url) {
        if (!url) return null;
        
        // SPECIFIC patterns for video ID extraction (order matters - most specific first)
        const patterns = [
            // Standard youtube.com/watch?v=VIDEO_ID (must be exactly ?v= or &v=)
            /[?&]v=([a-zA-Z0-9_-]{11})(?:[&=#]|$)/,
            // YouTube live URLs: youtube.com/live/VIDEO_ID
            /youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:[?&#]|$)/,
            // Short URLs: youtu.be/VIDEO_ID
            /youtu\.be\/([a-zA-Z0-9_-]{11})(?:[?&#]|$)/,
            // Embedded URLs: youtube.com/embed/VIDEO_ID
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:[?&#]|$)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && this.isValidVideoId(match[1])) {
                return match[1];
            }
        }
        
        return null;
    }
    
    extractVideoIdFromTitle(title) {
        if (!title) return null;
        
        // Try to extract video ID from tab title
        // Sometimes titles contain the video ID or URL
        const patterns = [
            // Video ID in parentheses or brackets
            /\(([a-zA-Z0-9_-]{11})\)/,
            /\[([a-zA-Z0-9_-]{11})\]/,
            // Video ID after dash or pipe
            / - ([a-zA-Z0-9_-]{11})/,
            / \| ([a-zA-Z0-9_-]{11})/,
            // Any 11-character sequence that looks like video ID
            /([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match && this.isValidVideoId(match[1])) {
                return match[1];
            }
        }
        
        return null;
    }
    
    isValidVideoId(id) {
        if (!id || typeof id !== 'string') return false;
        
        // YouTube video IDs are exactly 11 characters
        if (id.length !== 11) return false;
        
        // Must match the Base64 character set for video IDs
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) return false;
        
        // EXCLUDE known non-video ID patterns:
        
        // Playlist IDs start with 'PL' and are much longer
        if (id.startsWith('PL')) return false;
        
        // Channel IDs start with 'UC' and are longer than 11 chars (but check anyway)
        if (id.startsWith('UC')) return false;
        
        // Other YouTube list types
        if (id.startsWith('UU') || id.startsWith('FL') || id.startsWith('LL')) return false;
        
        // Valid video ID
        return true;
    }
    
    sortVideoData(videoData, sortOrder) {
        // Create a copy to avoid mutating the original array
        const sortedData = [...videoData];
        
        switch (sortOrder) {
            case 'newest':
                return sortedData.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
                
            case 'oldest':
                return sortedData.sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
                
            case 'english':
                return sortedData.sort((a, b) => {
                    const aIsEnglish = this.isLikelyEnglish(a.title);
                    const bIsEnglish = this.isLikelyEnglish(b.title);
                    if (aIsEnglish && !bIsEnglish) return -1;
                    if (!aIsEnglish && bIsEnglish) return 1;
                    return 0; // Keep original order for same language type
                });
                
            case 'non-english':
                return sortedData.sort((a, b) => {
                    const aIsEnglish = this.isLikelyEnglish(a.title);
                    const bIsEnglish = this.isLikelyEnglish(b.title);
                    if (!aIsEnglish && bIsEnglish) return -1;
                    if (aIsEnglish && !bIsEnglish) return 1;
                    return 0; // Keep original order for same language type
                });
                
            case 'left-right':
                return sortedData.sort((a, b) => (a.index || 0) - (b.index || 0));
                
            case 'right-left':
                return sortedData.sort((a, b) => (b.index || 0) - (a.index || 0));
                
            default:
                return sortedData; // Return unsorted if unknown sort order
        }
    }
    
    isLikelyEnglish(text) {
        if (!text) return false;
        
        // Simple heuristic to detect English text
        // Check for common English words and patterns
        const commonEnglishWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'shall', 'this', 'that', 'these', 'those'
        ];
        
        const lowerText = text.toLowerCase();
        
        // Count English words
        let englishWordCount = 0;
        for (const word of commonEnglishWords) {
            if (lowerText.includes(word)) {
                englishWordCount++;
            }
        }
        
        // Check for Latin alphabet dominance
        const latinChars = text.match(/[a-zA-Z]/g) || [];
        const totalChars = text.replace(/\s/g, '').length;
        const latinRatio = latinChars.length / Math.max(totalChars, 1);
        
        // Consider it English if:
        // 1. Has at least 2 common English words, OR
        // 2. Latin characters make up more than 70% of non-space characters
        return englishWordCount >= 2 || latinRatio > 0.7;
    }
    
    async createWatchVideosQueue(videoIds) {
        try {
            // KISS - Keep It Simple, Stupid
            // Just create the watch_videos URL exactly as you said
            const videoIdsParam = videoIds.join(',');
            const queueUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIdsParam}`;
            
            console.log(`Creating YouTube Native queue with ${videoIds.length} videos`);
            console.log(`URL: ${queueUrl}`);
            
            // Check URL length limit
            if (queueUrl.length > this.MAX_URL_LENGTH) {
                console.log(`URL too long (${queueUrl.length} chars), falling back to embedded mode`);
                return await this.createEmbeddedQueue(videoIds);
            }
            
            const tab = await chrome.tabs.create({
                url: queueUrl,
                active: true
            });
            
            return {
                success: true,
                url: queueUrl,
                newTabId: tab.id
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create watch_videos queue: ' + error.message
            };
        }
    }
    
    async createEmbeddedQueue(videoIds) {
        try {
            // Get current window to ensure proper context
            const currentWindow = await chrome.windows.getCurrent();
            const windowId = currentWindow.id;
            
            // Create URL with video IDs and windowId as parameters
            const embedUrl = chrome.runtime.getURL('embed_page.html') + 
                '?ids=' + encodeURIComponent(videoIds.join(',')) + 
                '&windowId=' + windowId;
            
            // Check if we already have an embed page open in the CURRENT WINDOW only
            const existingTabs = await chrome.tabs.query({
                url: chrome.runtime.getURL('embed_page.html') + '*',
                currentWindow: true  // This ensures isolation between browser windows
            });
            
            let tab;
            if (existingTabs.length > 0) {
                // Update existing embed page in current window
                tab = existingTabs[0];
                await chrome.tabs.update(tab.id, {
                    url: embedUrl,
                    active: true
                });
            } else {
                // Create new embed page in current window
                tab = await chrome.tabs.create({
                    url: embedUrl,
                    active: true
                });
            }
            
            // Store video IDs for the embed page with window-specific key
            await chrome.storage.local.set({
                [`currentQueue_${windowId}`]: videoIds,
                [`queueTimestamp_${windowId}`]: Date.now()
            });
            
            return {
                success: true,
                url: embedUrl,
                newTabId: tab.id
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create embedded queue: ' + error.message
            };
        }
    }
    
    async closeOriginalTabs(videoData, excludeTabId) {
        try {
            const tabsToClose = videoData
                .map(video => video.id)
                .filter(tabId => tabId !== excludeTabId && tabId !== undefined);
            
            if (tabsToClose.length > 0) {
                await chrome.tabs.remove(tabsToClose);
            }
        } catch (error) {
            // Silently handle tab closing errors
            // Don't fail the entire operation if closing tabs fails
        }
    }
}

// Initialize background service worker
const gatherTube = new GatherTubeBackground();

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
});

// Handle context invalidation
self.addEventListener('activate', event => {
});