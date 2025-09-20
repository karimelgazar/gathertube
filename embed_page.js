// Embedded Player JavaScript for GatherTube extension

class GatherTubePlayer {
    constructor() {
        this.player = null;
        this.videoIds = [];
        this.currentVideoIndex = 0;
        this.isPlayerReady = false;
        this.isPlaylistPanelOpen = false;
        this.draggedItem = null;
        
        this.elements = {};
        this.init();
    }
    
    init() {
        this.initElements();
        this.bindEvents();
        this.parseVideoIds();
        this.showLoading();
        
        // Initialize iframe-based player (no external API needed)
        console.log('Initializing iframe-based YouTube player...');
        this.loadYouTubeAPI();
    }
    
    loadYouTubeAPI() {
        // Skip external API loading - use iframe approach instead
        console.log('Using iframe-based YouTube player (no external API required)');
        
        // Initialize player directly without YouTube API
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
        
        console.log('URL params:', urlParams.toString());
        console.log('IDs param:', idsParam);
        
        if (idsParam) {
            this.videoIds = idsParam.split(',').filter(id => id.trim().length === 11);
        } else {
            this.loadStoredQueue();
        }
        
        console.log('Parsed video IDs:', this.videoIds);
        
        if (this.videoIds.length === 0) {
            this.showError('No video IDs found. Please use the extension to gather videos first.');
            return;
        }
        
        this.updateUI();
    }
    
    async loadStoredQueue() {
        try {
            const result = await chrome.storage.local.get(['currentQueue']);
            if (result.currentQueue && Array.isArray(result.currentQueue)) {
                this.videoIds = result.currentQueue;
            }
        } catch (error) {
            console.error('Failed to load stored queue:', error);
        }
    }
    
    async saveQueue() {
        try {
            await chrome.storage.local.set({
                currentQueue: this.videoIds,
                queueTimestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to save queue:', error);
        }
    }
    
    initIframePlayer() {
        if (this.videoIds.length === 0) {
            this.showError('No video IDs found to play.');
            return;
        }
        
        console.log('Initializing iframe-based player with video IDs:', this.videoIds);
        
        try {
            // Create YouTube iframe directly
            const playerContainer = document.getElementById('player');
            if (!playerContainer) {
                this.showError('Player container not found.');
                return;
            }
            
            // Build single video URL for iframe (no playlist - we'll handle switching manually)
            const iframeSrc = `https://www.youtube.com/embed/${this.videoIds[0]}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`;
            
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
                console.log('Iframe loaded for video:', this.videoIds[this.currentVideoIndex]);
            });
            
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
            
            console.log('Iframe player created successfully with first video:', this.videoIds[0]);
            
        } catch (error) {
            console.error('Failed to initialize iframe player:', error);
            this.showError('Failed to initialize video player: ' + error.message);
        }
    }
    
    // Old YouTube API methods removed - using iframe approach now
    
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
        
        console.log('Updated video info:', title, 'ID:', videoId);
    }
    
    // Using updateCurrentVideoSimple() instead for iframe player
    
    playVideo(index) {
        if (index < 0 || index >= this.videoIds.length || !this.isPlayerReady) return;
        
        this.currentVideoIndex = index;
        const videoId = this.videoIds[index];
        
        try {
            // For iframe player, we need to recreate the iframe with the new video
            const playerContainer = document.getElementById('player');
            const iframe = playerContainer.querySelector('iframe');
            
            if (iframe) {
                // Switch to single video URL
                const newSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`;
                
                iframe.src = newSrc;
                console.log('Switched to video:', videoId, 'at index:', index);
            }
            
            this.updateCurrentVideoSimple();
        } catch (error) {
            console.error('Failed to load video:', error);
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
                <div class="item-duration">--:--</div>
            </div>
            <div class="item-actions">
                <button class="play-now-btn" title="Play Now">▶</button>
                <button class="delete-btn" title="Remove">🗑️</button>
            </div>
        `;
        
        // Bind events
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.item-actions')) {
                console.log('Clicked playlist item at index:', index, 'videoId:', videoId);
                this.playVideo(index);
                // Close playlist panel on mobile after selection
                if (window.innerWidth <= 768) {
                    this.togglePlaylistPanel();
                }
            }
        });
        
        item.querySelector('.play-now-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.playVideo(index);
        });
        
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFromQueue(index);
        });
        
        // Drag and drop events
        item.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
        item.addEventListener('dragover', (e) => this.handleDragOver(e));
        item.addEventListener('drop', (e) => this.handleDrop(e, index));
        item.addEventListener('dragend', () => this.handleDragEnd());
        
        // Load video title and duration asynchronously
        this.loadVideoInfo(videoId, item.querySelector('.item-title'), item.querySelector('.item-duration'));
        
        return item;
    }
    
    async loadVideoInfo(videoId, titleElement, durationElement) {
        try {
            // Try to get title from YouTube API (basic method using oEmbed)
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (response.ok) {
                const data = await response.json();
                titleElement.textContent = data.title;
                titleElement.title = data.title;
            }
            
            // Try to get duration from YouTube thumbnail API (limited info)
            // Note: This is a basic approach - full duration would require YouTube Data API
            const thumbnailResponse = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
            if (thumbnailResponse.ok) {
                // For now, show that we have video info
                durationElement.textContent = '📹';
            }
        } catch (error) {
            // Fallback to generic info
            console.warn('Failed to load video info:', error);
            durationElement.textContent = '--:--';
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
    
    handleDragStart(e, index) {
        this.draggedItem = { index, element: e.target };
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const target = e.target.closest('.playlist-item');
        if (target && target !== this.draggedItem?.element) {
            target.classList.add('drag-over');
        }
    }
    
    handleDrop(e, dropIndex) {
        e.preventDefault();
        
        if (!this.draggedItem || this.draggedItem.index === dropIndex) return;
        
        const dragIndex = this.draggedItem.index;
        const videoId = this.videoIds[dragIndex];
        
        // Remove from old position
        this.videoIds.splice(dragIndex, 1);
        
        // Adjust drop index if necessary
        const newDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
        
        // Insert at new position
        this.videoIds.splice(newDropIndex, 0, videoId);
        
        // Update current index
        if (dragIndex === this.currentVideoIndex) {
            this.currentVideoIndex = newDropIndex;
        } else if (dragIndex < this.currentVideoIndex && newDropIndex >= this.currentVideoIndex) {
            this.currentVideoIndex--;
        } else if (dragIndex > this.currentVideoIndex && newDropIndex <= this.currentVideoIndex) {
            this.currentVideoIndex++;
        }
        
        this.renderPlaylist();
        this.updateUI();
        this.saveQueue();
    }
    
    handleDragEnd() {
        if (this.draggedItem) {
            this.draggedItem.element.classList.remove('dragging');
        }
        
        document.querySelectorAll('.playlist-item.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        this.draggedItem = null;
    }
    
    openInYouTube() {
        if (this.videoIds.length === 0) return;
        
        const videoIdsParam = this.videoIds.join(',');
        const watchVideosUrl = `https://www.youtube.com/watch_videos?video_ids=${encodeURIComponent(videoIdsParam)}`;
        
        window.open(watchVideosUrl, '_blank');
    }
    
    handleKeydown(e) {
        // Don't interfere with player controls
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case 'ArrowRight':
                if (e.shiftKey) {
                    this.playNext();
                    e.preventDefault();
                }
                break;
            case 'ArrowLeft':
                if (e.shiftKey) {
                    this.playPrevious();
                    e.preventDefault();
                }
                break;
            case 'p':
            case 'P':
                if (!e.ctrlKey && !e.altKey) {
                    this.togglePlaylistPanel();
                    e.preventDefault();
                }
                break;
            case 'Escape':
                if (this.isPlaylistPanelOpen) {
                    this.togglePlaylistPanel();
                    e.preventDefault();
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
        
        // Add specific guidance for YouTube API issues
        if (message.includes('YouTube API') || message.includes('security restrictions')) {
            const errorContent = this.elements.errorMessage.querySelector('.error-content');
            if (errorContent && !errorContent.querySelector('.api-help')) {
                const helpDiv = document.createElement('div');
                helpDiv.className = 'api-help';
                helpDiv.style.marginTop = '12px';
                helpDiv.style.fontSize = '12px';
                helpDiv.innerHTML = `
                    <p><strong>Troubleshooting:</strong></p>
                    <ul style="text-align: left; padding-left: 20px;">
                        <li>Disable ad blockers for this page</li>
                        <li>Check if YouTube is accessible</li>
                        <li>Try the default 'watch_videos' mode instead</li>
                    </ul>
                `;
                errorContent.appendChild(helpDiv);
            }
        }
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
    console.log('YouTube IFrame API ready');
};