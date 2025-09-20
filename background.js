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
            
            // Check URL for YouTube patterns (including suspended/modified URLs)
            const urlToCheck = tab.url || '';
            const titleToCheck = tab.title || '';
            
            // Multiple patterns to catch YouTube videos
            const patterns = [
                // Standard YouTube URLs
                /youtube\.com\/watch/i,
                /youtube\.com\/live/i,
                /youtu\.be\//i,
                // Suspended tab patterns (memory extensions)
                /suspended.*youtube/i,
                /youtube.*suspended/i,
                // Check title for YouTube indicators
                /youtube/i
            ];
            
            // Check if URL or title matches any pattern
            const matchesPattern = patterns.some(pattern => 
                pattern.test(urlToCheck) || pattern.test(titleToCheck)
            );
            
            if (!matchesPattern) return false;
            
            // Additional check: extract video ID if possible
            const videoId = this.extractVideoId(urlToCheck) || this.extractVideoIdFromTitle(titleToCheck);
            if (videoId) {
            }
            return videoId !== null;
            
        }).map(tab => ({
            id: tab.id,
            url: tab.url,
            title: tab.title || 'YouTube Video',
            index: tab.index, // Tab position for left-right/right-left sorting
            lastAccessed: tab.lastAccessed || Date.now() // For newest/oldest sorting
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
        
        // Multiple patterns to extract video IDs
        const patterns = [
            // Standard youtube.com/watch?v=ID
            /[&?]v=([a-zA-Z0-9_-]{11})/,
            // youtu.be/ID
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            // youtube.com/live/ID
            /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
            // Any 11-character YouTube video ID pattern
            /(?:youtube\.com|youtu\.be).*[=/]([a-zA-Z0-9_-]{11})/,
            // Extract from suspended URLs or other formats
            /[=/]([a-zA-Z0-9_-]{11})(?:[&?#]|$)/
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
        // Basic validation for YouTube video ID
        return id && id.length === 11 && /^[a-zA-Z0-9_-]+$/.test(id);
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
            // Get current window to ensure proper context
            const currentWindow = await chrome.windows.getCurrent();
            const windowId = currentWindow.id;
            
            // Use the correct format for YouTube playlist - try multiple approaches
            const videoIdsParam = videoIds.join(',');
            let queueUrl;
            
            // Try different URL formats based on video count and context
            if (videoIds.length === 1) {
                // Single video - use regular watch URL
                queueUrl = `https://www.youtube.com/watch?v=${videoIds[0]}`;
            } else if (videoIds.length <= 50) {
                // Multiple videos - use watch_videos format
                queueUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIdsParam}`;
            } else {
                // Too many videos - fall back to embedded mode
                console.log(`Too many videos (${videoIds.length}) for YouTube Native mode. Falling back to embedded mode.`);
                return await this.createEmbeddedQueue(videoIds);
            }
            
            // Check URL length limit - be more conservative for watch_videos
            if (queueUrl.length > this.MAX_URL_LENGTH || videoIds.length > 50) {
                console.log(`YouTube Native mode: URL too long (${queueUrl.length} chars) or too many videos (${videoIds.length}). Falling back to embedded mode.`);
                return await this.createEmbeddedQueue(videoIds);
            }
            
            console.log(`Creating YouTube Native queue with ${videoIds.length} videos in window ${windowId}`);
            console.log(`Queue URL length: ${queueUrl.length} characters`);
            console.log(`Watch videos URL: ${queueUrl}`);
            
            // Store video IDs for potential debugging and window-specific tracking
            await chrome.storage.local.set({
                [`nativeQueue_${windowId}`]: videoIds,
                [`nativeQueueTimestamp_${windowId}`]: Date.now(),
                [`lastNativeUrl_${windowId}`]: queueUrl
            });
            
            const tab = await chrome.tabs.create({
                url: queueUrl,
                active: true
            });
            
            // Set a timeout to check if the YouTube page properly loaded the queue
            setTimeout(async () => {
                try {
                    const updatedTab = await chrome.tabs.get(tab.id);
                    console.log(`YouTube Native tab after 3 seconds: ${updatedTab.url}`);
                    
                    // If YouTube redirected to a single video instead of playlist, that might indicate an issue
                    if (updatedTab.url && updatedTab.url.includes('/watch?v=') && !updatedTab.url.includes('list=')) {
                        console.warn(`YouTube Native mode may have failed - redirected to single video: ${updatedTab.url}`);
                    }
                } catch (error) {
                    // Tab might have been closed or moved, ignore
                }
            }, 3000);
            
            return {
                success: true,
                url: queueUrl,
                newTabId: tab.id
            };
        } catch (error) {
            console.error('Failed to create watch_videos queue:', error);
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
                [`queueTimestamp_${windowId}`]: Date.now(),
                // Keep the old keys for backward compatibility, but use window-specific for new sessions
                currentQueue: videoIds,
                queueTimestamp: Date.now()
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