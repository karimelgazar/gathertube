// Popup JavaScript for GatherTube extension - Firefox Compatible
// Uses browser.* APIs with chrome.* fallback for cross-browser compatibility

// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class GatherTubePopup {
    constructor() {
        this.embedModeCheckbox = document.getElementById('embedMode');
        this.closeTabsCheckbox = document.getElementById('closeTabs');
        this.sortOrderSelect = document.getElementById('sortOrder');
        this.modeText = document.getElementById('modeText');
        this.gatherBtn = document.getElementById('gatherBtn');
        this.loader = document.getElementById('loader');
        this.messageDiv = document.getElementById('message');
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.bindEvents();
        this.updateModeText();
    }
    
    async loadSettings() {
        try {
            const result = await browserAPI.storage.local.get({
                embedMode: false,
                closeTabs: false,
                sortOrder: 'newest'
            });
            
            this.embedModeCheckbox.checked = result.embedMode;
            this.closeTabsCheckbox.checked = result.closeTabs;
            this.sortOrderSelect.value = result.sortOrder;
        } catch (error) {
            this.showMessage('Failed to load settings', 'error');
        }
    }
    
    async saveSettings() {
        try {
            await browserAPI.storage.local.set({
                embedMode: this.embedModeCheckbox.checked,
                closeTabs: this.closeTabsCheckbox.checked,
                sortOrder: this.sortOrderSelect.value
            });
        } catch (error) {
            this.showMessage('Failed to save settings', 'error');
        }
    }
    
    bindEvents() {
        // Toggle change events
        this.embedModeCheckbox.addEventListener('change', () => {
            this.updateModeText();
            this.saveSettings();
        });
        
        this.closeTabsCheckbox.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.sortOrderSelect.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Gather button click
        this.gatherBtn.addEventListener('click', () => {
            this.gatherVideos();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.gatherVideos();
            }
        });
    }
    
    updateModeText() {
        this.modeText.textContent = this.embedModeCheckbox.checked ? 'Embedded Player' : 'YouTube Native';
    }
    
    async gatherVideos() {
        if (this.gatherBtn.disabled) return;
        
        this.setLoading(true);
        this.hideMessage();
        
        try {
            const response = await browserAPI.runtime.sendMessage({
                action: 'gather',
                embedMode: this.embedModeCheckbox.checked,
                closeTabs: this.closeTabsCheckbox.checked,
                sortOrder: this.sortOrderSelect.value
            });
            
            if (response.success) {
                this.showMessage(response.message || `Gathered ${response.videoCount} video(s) successfully!`, 'success');
                
                // Close popup after successful gather (optional)
                setTimeout(() => {
                    window.close();
                }, 1500);
            } else {
                this.showMessage(response.message || 'Failed to gather videos', 'error');
            }
        } catch (error) {
            this.showMessage('Failed to communicate with extension', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        this.gatherBtn.disabled = loading;
        const btnText = this.gatherBtn.querySelector('.btn-text');
        
        if (loading) {
            btnText.style.display = 'none';
            this.loader.style.display = 'inline-block';
        } else {
            btnText.style.display = 'inline';
            this.loader.style.display = 'none';
        }
    }
    
    showMessage(text, type = 'info') {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 3000);
        }
    }
    
    hideMessage() {
        this.messageDiv.style.display = 'none';
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GatherTubePopup();
});

// Handle extension context invalidated - Firefox compatible
if (typeof browser !== 'undefined') {
    // Firefox WebExtensions API
    browser.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
        if (request.action === 'popup-update') {
            // Handle any updates from background script
        }
    });
} else {
    // Chrome extension API fallback
    chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
        if (request.action === 'popup-update') {
            // Handle any updates from background script
        }
    });
}