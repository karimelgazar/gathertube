// Embedded Player JavaScript for GatherTube extension - Firefox Compatible
// Uses browser.* APIs with chrome.* fallback for cross-browser compatibility

// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class GatherTubePlayer {
    constructor() {
        this.player = null;
        this.videoIds = [];
        this.currentVideoIndex = 0;
        this.isPlayerReady = false;
        this.isPlaylistPanelOpen = false;
        this.draggedItem = null;
        this.windowId = null; // Store window ID for per-window isolation
        
        this.elements = {};
        this.init();
    }
    
    init() {
        this.initElements();
        this.bindEvents();
        this.parseVideoIds();
        this.showLoading();
        
        // Initialize iframe-based player (no external API needed)
        this.loadYouTubeAPI();
    }
    
    loadYouTubeAPI() {
        setTimeout(() => {
            this.initIframePlayer();
        }, 100);
    }
    
    initElements() {
        this.elements = {
            playlistToggle: document.getElementById('playlistToggle'),
            playlistPanel: document.getElementById('playlistPanel'),
            closePanel: document.getElementById('closePanel'),
            queueCount: document.getElementById('queueCount'),
            playlistCount: document.getElementById('playlistCount'),
            playlistItems: document.getElementById('playlistItems'),
            currentVideoTitle: document.getElementById('currentVideoTitle'),
            currentVideoIndex: document.getElementById('currentVideoIndex'),
            totalVideos: document.getElementById('totalVideos'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            retryButton: document.getElementById('retryButton'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            clearQueue: document.getElementById('clearQueue'),
            shuffleQueue: document.getElementById('shuffleQueue'),
            openInYoutube: document.getElementById('openInYoutube'),
            prevVideo: document.getElementById('prevVideo'),
            nextVideo: document.getElementById('nextVideo')
        };
    }
    
    bindEvents() {
        // Playlist panel toggle
        this.elements.playlistToggle.addEventListener('click', () => this.togglePlaylistPanel());
        this.elements.closePanel.addEventListener('click', () => this.togglePlaylistPanel());
        
        // Queue management
        this.elements.clearQueue.addEventListener('click', () => this.clearQueue());
        this.elements.shuffleQueue.addEventListener('click', () => this.shuffleQueue());
        this.elements.retryButton.addEventListener('click', () => this.retry());
        
        // Open in YouTube
        this.elements.openInYoutube.addEventListener('click', () => this.openInYouTube());
        
        // Navigation buttons
        this.elements.prevVideo.addEventListener('click', () => this.playPrevious());
        this.elements.nextVideo.addEventListener('click', () => this.playNext());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isPlaylistPanelOpen && !this.elements.playlistPanel.contains(e.target) && 
                !this.elements.playlistToggle.contains(e.target)) {
                this.togglePlaylistPanel();
            }
        });
    }
    
    parseVideoIds() {
        const urlParams = new URLSearchParams(window.location.search);
        const idsParam = urlParams.get('ids');
        const windowIdParam = urlParams.get('windowId');
        
        // Store windowId for per-window isolation
        this.windowId = windowIdParam || 'global';
        
        if (idsParam) {
            this.videoIds = idsParam.split(',').filter(id => id.trim().length === 11);
        } else {
            this.loadStoredQueue();
        }
        
        if (this.videoIds.length === 0) {
            this.showError('No video IDs found. Please use the extension to gather videos first.');
            return;
        }
        
        this.updateUI();
    }
    
    async loadStoredQueue() {
        try {
            // Use window-specific storage key for per-window isolation
            const storageKey = this.windowId ? `currentQueue_${this.windowId}` : 'currentQueue';
            const result = await browserAPI.storage.local.get([storageKey]);
            
            if (result[storageKey] && Array.isArray(result[storageKey])) {
                this.videoIds = result[storageKey];
            }
        } catch (error) {
            // Silently handle storage errors
        }
    }
    
    async saveQueue() {
        try {
            // Use window-specific storage key for per-window isolation
            const storageKey = this.windowId ? `currentQueue_${this.windowId}` : 'currentQueue';
            const timestampKey = this.windowId ? `queueTimestamp_${this.windowId}` : 'queueTimestamp';
            
            const storageData = {
                [storageKey]: this.videoIds,
                [timestampKey]: Date.now()
            };
            
            await browserAPI.storage.local.set(storageData);
        } catch (error) {
            // Silently handle storage errors
        }
    }
    
    initIframePlayer() {
        if (this.videoIds.length === 0) {
            this.showError('No video IDs found to play.');
            return;
        }
        
        try {
            // Create YouTube iframe directly
            const playerContainer = document.getElementById('player');
            if (!playerContainer) {
                this.showError('Player container not found.');
                return;
            }
            
            // Build single video URL for iframe with JS API enabled for event detection
            // Use YouTube-nocookie domain and strong parameters to disable endscreen
            const iframeSrc = `https://www.youtube-nocookie.com/embed/${this.videoIds[0]}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&fs=0&disablekb=1&origin=${window.location.origin}`;
            
            // Create and configure iframe
            const iframe = document.createElement('iframe');
            iframe.src = iframeSrc;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            iframe.allow = 'autoplay; encrypted-media';
            iframe.allowFullscreen = true;
            iframe.style.borderRadius = '12px';
            iframe.id = 'youtube-iframe';
            
            // Add load event listener
            iframe.addEventListener('load', () => {
                // Iframe loaded successfully
            });
            
            // Listen for YouTube iframe messages for auto-next functionality
            this.messageListener = (event) => {
                // Accept messages from various YouTube origins
                const isYouTubeOrigin = event.origin === 'https://www.youtube.com' || 
                                       event.origin === 'https://youtube.com' ||
                                       event.origin.endsWith('.youtube.com') ||
                                       event.origin === 'https://www.youtube-nocookie.com';
                                       
                if (isYouTubeOrigin) {
                    try {
                        let data = event.data;
                        
                        // Handle different data formats
                        if (typeof data === 'string') {
                            // Try to parse JSON string
                            try {
                                data = JSON.parse(data);
                            } catch {
                                // If not JSON, check if it contains video state info
                                if (data.includes('"event":"video-state-change"') && data.includes('"info":0')) {
                                    this.handleVideoEnd();
                                    return;
                                } else if (data.includes('"playerState":0') || data.includes('"state":0')) {
                                    this.handleVideoEnd();
                                    return;
                                } else if (data.includes('onStateChange') && data.includes('0')) {
                                    this.handleVideoEnd();
                                    return;
                                }
                                return;
                            }
                        }
                        
                        // Handle parsed data object
                        if (data && typeof data === 'object') {
                            
                            // Check various YouTube message formats for video end (state 0)
                            if ((data.event === 'video-state-change' || data.event === 'onStateChange') && (data.info === 0 || data.data === 0)) {
                                this.handleVideoEnd();
                            } else if (data.info === 0 || data.data === 0) {
                                this.handleVideoEnd();
                            } else if (data.playerState === 0 || data.state === 0) {
                                this.handleVideoEnd();
                            } else if (data.info && data.info.playerState === 0) {
                                this.handleVideoEnd();
                            } else if (data.args && (data.args.state === 0 || data.args.playerState === 0)) {
                                this.handleVideoEnd();
                            } else if (data.event === 'video-ended') {
                                this.handleVideoEnd();
                            }
                        }
                    } catch (e) {
                        // Silently ignore message processing errors
                    }
                }
            };
            
            window.addEventListener('message', this.messageListener);
            
            // Add fallback polling mechanism for video end detection
            this.startVideoEndPolling();
            
            // Clear container and add iframe
            playerContainer.innerHTML = '';
            playerContainer.appendChild(iframe);
            
            // Simulate player ready
            this.isPlayerReady = true;
            this.hideLoading();
            this.hideError();
            this.updateCurrentVideoSimple();
            this.renderPlaylist();
            this.elements.openInYoutube.style.display = 'block';
            
        } catch (error) {
            this.showError('Failed to initialize video player: ' + error.message);
        }
    }
    
    // Continue with all other methods from the original embed_page.js
    // This is a simplified version focusing on the cross-browser compatibility changes
    // The rest of the methods remain the same but with browserAPI instead of chrome
    
    updateCurrentVideoSimple() {
        // Simple video info update for iframe player (limited functionality)
        const videoId = this.videoIds[this.currentVideoIndex];
        const title = `Video ${this.currentVideoIndex + 1} of ${this.videoIds.length}`;
        
        this.elements.currentVideoTitle.textContent = title;
        this.elements.currentVideoIndex.textContent = this.currentVideoIndex + 1;
        this.elements.totalVideos.textContent = this.videoIds.length;
        
        // Update navigation button states
        this.elements.prevVideo.disabled = this.currentVideoIndex === 0;
        this.elements.nextVideo.disabled = this.currentVideoIndex === this.videoIds.length - 1;
        
        this.updatePlaylistCurrentItem();
        document.title = `${title} - GatherTube Player`;
    }
    
    handleVideoEnd() {
        // Prevent multiple triggers in short succession
        if (this.lastVideoEndTime && Date.now() - this.lastVideoEndTime < 3000) {
            return;
        }
        
        this.lastVideoEndTime = Date.now();
        
        setTimeout(() => {
            if (this.currentVideoIndex < this.videoIds.length - 1) {
                this.playNext();
            }
        }, 1500); // Slightly longer delay for smooth transition
    }
    
    startVideoEndPolling() {
        // Clear any existing polling
        if (this.videoPolling) {
            clearInterval(this.videoPolling);
        }
        
        // Poll every 10 seconds to check for video end as backup
        this.videoPolling = setInterval(() => {
            try {
                const iframe = document.getElementById('youtube-iframe');
                if (iframe) {
                    // Try to detect if video has ended by sending various messages to iframe
                    iframe.contentWindow.postMessage('{"event":"listening"}', 'https://www.youtube.com');
                    iframe.contentWindow.postMessage('{"event":"listening"}', 'https://www.youtube-nocookie.com');
                    
                    // Also try getting player state
                    iframe.contentWindow.postMessage('{"event":"command","func":"getPlayerState"}', 'https://www.youtube.com');
                    iframe.contentWindow.postMessage('{"event":"command","func":"getPlayerState"}', 'https://www.youtube-nocookie.com');
                }
            } catch (e) {
                // Silently ignore polling errors
            }
        }, 10000);
        
        // Stop polling after a reasonable time (30 minutes per video max)
        setTimeout(() => {
            if (this.videoPolling) {
                clearInterval(this.videoPolling);
            }
        }, 30 * 60 * 1000);
    }
    
    cleanup() {
        // Clean up event listeners and polling
        if (this.messageListener) {
            window.removeEventListener('message', this.messageListener);
        }
        if (this.videoPolling) {
            clearInterval(this.videoPolling);
            this.videoPolling = null;
        }
    }
    
    playVideo(index) {
        if (index < 0 || index >= this.videoIds.length || !this.isPlayerReady) {
            return;
        }
        
        this.currentVideoIndex = index;
        const videoId = this.videoIds[index];
        
        try {
            // For iframe player, we need to recreate the iframe with the new video
            const playerContainer = document.getElementById('player');
            const iframe = playerContainer.querySelector('iframe');
            
            if (iframe) {
                // Switch to single video URL with JS API enabled and suggestions disabled
                const newSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&fs=0&disablekb=1&origin=${window.location.origin}`;
                
                iframe.src = newSrc;
                
                // Restart polling for the new video
                this.startVideoEndPolling();
            }
            
            this.updateCurrentVideoSimple();
        } catch (error) {
            // Silently handle video loading errors
        }
    }
    
    playNext() {
        const nextIndex = (this.currentVideoIndex + 1) % this.videoIds.length;
        this.playVideo(nextIndex);
    }
    
    playPrevious() {
        const prevIndex = this.currentVideoIndex === 0 ? this.videoIds.length - 1 : this.currentVideoIndex - 1;
        this.playVideo(prevIndex);
    }
    
    togglePlaylistPanel() {
        this.isPlaylistPanelOpen = !this.isPlaylistPanelOpen;
        this.elements.playlistPanel.classList.toggle('open', this.isPlaylistPanelOpen);
        this.elements.playlistToggle.classList.toggle('active', this.isPlaylistPanelOpen);
    }
    
    renderPlaylist() {
        if (!this.elements.playlistItems) return;
        
        this.elements.playlistItems.innerHTML = '';
        this.elements.queueCount.textContent = this.videoIds.length;
        this.elements.playlistCount.textContent = this.videoIds.length;
        
        this.videoIds.forEach((videoId, index) => {
            const item = this.createPlaylistItem(videoId, index);
            this.elements.playlistItems.appendChild(item);
        });
        
        this.updatePlaylistCurrentItem();
    }
    
    createPlaylistItem(videoId, index) {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.videoId = videoId;
        
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        
        item.innerHTML = `
            <div class="drag-handle">⋮⋮</div>
            <img class="item-thumbnail" src="${thumbnailUrl}" alt="Thumbnail" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCA0OCAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iMzYiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNMjAgMTJMMjggMTguNUwyMCAyNVYxMloiIGZpbGw9IiM2NjYiLz48L3N2Zz4='">
            <div class="item-info">
                <div class="item-title" title="Video ${index + 1}">Loading...</div>
                <div class="item-duration">Video</div>
            </div>
            <div class="item-actions">
                <button class="delete-btn" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path></svg>
                </button>
            </div>
        `;
        
        // Bind events
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.item-actions')) {
                this.playVideo(index);
                // Close playlist panel on mobile after selection
                if (window.innerWidth <= 768) {
                    this.togglePlaylistPanel();
                }
            }
        });
        
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFromQueue(index);
        });
        
        // Load video title asynchronously
        this.loadVideoInfo(videoId, item.querySelector('.item-title'), item.querySelector('.item-duration'));
        
        return item;
    }
    
    async loadVideoInfo(videoId, titleElement, durationElement) {
        try {
            // Get title from YouTube's oembed API
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (response.ok) {
                const data = await response.json();
                titleElement.textContent = data.title;
                titleElement.title = data.title;
            } else {
                // Fallback title
                const index = titleElement.closest('.playlist-item').dataset.index;
                titleElement.textContent = `Video ${index ? parseInt(index) + 1 : ''}`;
            }
            
            // Show simple duration placeholder
            durationElement.textContent = 'Video';
            
        } catch (error) {
            const index = titleElement.closest('.playlist-item').dataset.index;
            titleElement.textContent = `Video ${index ? parseInt(index) + 1 : ''}`;
            durationElement.textContent = 'Video';
        }
    }
    
    updatePlaylistCurrentItem() {
        const items = this.elements.playlistItems.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            item.classList.toggle('current', index === this.currentVideoIndex);
        });
    }
    
    removeFromQueue(index) {
        if (this.videoIds.length <= 1) {
            this.clearQueue();
            return;
        }
        
        this.videoIds.splice(index, 1);
        
        if (index === this.currentVideoIndex) {
            // If current video is removed, play next (or previous if it was the last)
            if (this.currentVideoIndex >= this.videoIds.length) {
                this.currentVideoIndex = this.videoIds.length - 1;
            }
            this.playVideo(this.currentVideoIndex);
        } else if (index < this.currentVideoIndex) {
            this.currentVideoIndex--;
        }
        
        this.renderPlaylist();
        this.updateUI();
        this.saveQueue();
    }
    
    clearQueue() {
        if (confirm('Are you sure you want to clear the entire queue?')) {
            this.videoIds = [];
            this.currentVideoIndex = 0;
            this.elements.playlistItems.innerHTML = '';
            this.updateUI();
            this.saveQueue();
            
            if (this.player && this.isPlayerReady) {
                this.player.stopVideo();
            }
            
            this.showError('Queue cleared. Use the extension to gather new videos.');
        }
    }
    
    shuffleQueue() {
        if (this.videoIds.length <= 1) return;
        
        const currentVideoId = this.videoIds[this.currentVideoIndex];
        
        // Fisher-Yates shuffle
        for (let i = this.videoIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.videoIds[i], this.videoIds[j]] = [this.videoIds[j], this.videoIds[i]];
        }
        
        // Update current index to match the shuffled position
        this.currentVideoIndex = this.videoIds.indexOf(currentVideoId);
        
        this.renderPlaylist();
        this.updateUI();
        this.saveQueue();
    }
    
    openInYouTube() {
        if (this.videoIds.length === 0) return;
        
        const videoIdsParam = this.videoIds.join(',');
        const watchVideosUrl = `https://www.youtube.com/watch_videos?video_ids=${encodeURIComponent(videoIdsParam)}`;
        
        window.open(watchVideosUrl, '_blank');
    }
    
    handleKeydown(e) {
        // Don't interfere with input fields or contenteditable elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
            return;
        }
        
        // Don't interfere if modifier keys (except Shift for navigation) are pressed
        const hasModifiers = e.ctrlKey || e.metaKey || e.altKey;
        
        switch (e.key) {
            case 'ArrowRight':
                if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.playNext();
                }
                break;
                
            case 'ArrowLeft':
                if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.playPrevious();
                }
                break;
                
            case 'p':
            case 'P':
                if (!hasModifiers) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.togglePlaylistPanel();
                }
                break;
                
            case 'Escape':
                if (this.isPlaylistPanelOpen && !hasModifiers) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.togglePlaylistPanel();
                }
                break;
                
            case 'n':
            case 'N':
                if (!hasModifiers) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.playNext();
                }
                break;
                
            case 'b':
            case 'B':
                if (!hasModifiers) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.playPrevious();
                }
                break;
        }
    }
    
    updateUI() {
        this.elements.queueCount.textContent = this.videoIds.length;
        this.elements.playlistCount.textContent = this.videoIds.length;
        this.elements.totalVideos.textContent = this.videoIds.length;
        this.elements.currentVideoIndex.textContent = this.currentVideoIndex + 1;
        
        if (this.videoIds.length === 0) {
            this.elements.currentVideoTitle.textContent = 'No videos in queue';
        }
    }
    
    showLoading() {
        this.elements.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }
    
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        this.hideLoading();
    }
    
    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
    
    retry() {
        this.hideError();
        this.parseVideoIds();
        if (this.videoIds.length > 0) {
            this.showLoading();
            this.initPlayer();
        }
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GatherTubePlayer();
});

// Global function for YouTube API
window.onYouTubeIframeAPIReady = function() {
    // YouTube IFrame API ready callback
};