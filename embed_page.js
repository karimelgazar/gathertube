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
        
        // Initialize YouTube player when API is ready
        if (window.YT && window.YT.Player) {
            console.log('YouTube API already loaded, initializing player...');
            this.initPlayer();
        } else {
            console.log('Waiting for YouTube API to load...');
            window.onYouTubeIframeAPIReady = () => {
                console.log('YouTube API ready, initializing player...');
                this.initPlayer();
            };
            
            // Fallback: try to initialize after a delay
            setTimeout(() => {
                if (!this.isPlayerReady && window.YT && window.YT.Player) {
                    console.log('Fallback: initializing player after timeout...');
                    this.initPlayer();
                }
            }, 3000);
        }
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
            openInYoutube: document.getElementById('openInYoutube')
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
    
    initPlayer() {
        if (this.videoIds.length === 0) {
            this.showError('No video IDs found to play.');
            return;
        }
        
        console.log('Initializing YouTube player with video IDs:', this.videoIds);
        
        try {
            // Check if YouTube API is properly loaded
            if (!window.YT || !window.YT.Player) {
                console.error('YouTube API not loaded');
                this.showError('YouTube API failed to load. Please refresh the page.');
                return;
            }
            
            this.player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: this.videoIds[0],
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    showinfo: 0,
                    rel: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    playsinline: 1
                },
                events: {
                    onReady: (event) => this.onPlayerReady(event),
                    onStateChange: (event) => this.onPlayerStateChange(event),
                    onError: (event) => this.onPlayerError(event)
                }
            });
            
            console.log('YouTube player created successfully');
        } catch (error) {
            console.error('Failed to initialize player:', error);
            this.showError('Failed to initialize video player: ' + error.message);
        }
    }
    
    onPlayerReady(event) {
        this.isPlayerReady = true;
        this.hideLoading();
        this.updateCurrentVideo();
        this.renderPlaylist();
        this.elements.openInYoutube.style.display = 'block';
        console.log('Player ready with', this.videoIds.length, 'videos');
    }
    
    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            this.playNext();
        } else if (event.data === YT.PlayerState.PLAYING) {
            this.updateCurrentVideo();
        }
    }
    
    onPlayerError(event) {
        console.error('Player error:', event.data);
        let errorMessage = 'Failed to load video.';
        
        switch (event.data) {
            case 2:
                errorMessage = 'Invalid video ID.';
                break;
            case 5:
                errorMessage = 'Video cannot be played in HTML5 player.';
                break;
            case 100:
                errorMessage = 'Video not found or private.';
                break;
            case 101:
            case 150:
                errorMessage = 'Video cannot be embedded.';
                break;
        }
        
        // Try to skip to next video
        if (this.videoIds.length > 1) {
            setTimeout(() => this.playNext(), 2000);
        } else {
            this.showError(errorMessage);
        }
    }
    
    updateCurrentVideo() {
        if (!this.player || !this.isPlayerReady) return;
        
        try {
            const videoData = this.player.getVideoData();
            const title = videoData.title || `Video ${this.currentVideoIndex + 1}`;
            
            this.elements.currentVideoTitle.textContent = title;
            this.elements.currentVideoIndex.textContent = this.currentVideoIndex + 1;
            this.elements.totalVideos.textContent = this.videoIds.length;
            
            this.updatePlaylistCurrentItem();
            document.title = `${title} - GatherTube Player`;
        } catch (error) {
            console.error('Failed to update current video:', error);
        }
    }
    
    playVideo(index) {
        if (index < 0 || index >= this.videoIds.length || !this.isPlayerReady) return;
        
        this.currentVideoIndex = index;
        const videoId = this.videoIds[index];
        
        try {
            this.player.loadVideoById(videoId);
        } catch (error) {
            console.error('Failed to load video:', error);
            this.playNext();
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
                this.playVideo(index);
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
        
        // Load video title asynchronously
        this.loadVideoTitle(videoId, item.querySelector('.item-title'));
        
        return item;
    }
    
    async loadVideoTitle(videoId, titleElement) {
        try {
            // Try to get title from YouTube API (basic method using oEmbed)
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (response.ok) {
                const data = await response.json();
                titleElement.textContent = data.title;
                titleElement.title = data.title;
            }
        } catch (error) {
            // Fallback to generic title
            console.warn('Failed to load video title:', error);
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