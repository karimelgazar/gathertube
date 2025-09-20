// Options Page JavaScript for GatherTube extension

class GatherTubeOptions {
    constructor() {
        this.elements = {};
        this.init();
    }
    
    init() {
        this.initElements();
        this.bindEvents();
        this.loadSettings();
        this.loadExtensionInfo();
    }
    
    initElements() {
        this.elements = {
            defaultEmbedMode: document.getElementById('defaultEmbedMode'),
            defaultCloseTabs: document.getElementById('defaultCloseTabs'),
            defaultCurrentWindowOnly: document.getElementById('defaultCurrentWindowOnly'),
            defaultModeText: document.getElementById('defaultModeText'),
            resetSettings: document.getElementById('resetSettings'),
            messageDiv: document.getElementById('message'),
            version: document.getElementById('version'),
            queueSize: document.getElementById('queueSize'),
            lastUpdate: document.getElementById('lastUpdate'),
            reportIssue: document.getElementById('reportIssue'),
            rateExtension: document.getElementById('rateExtension'),
            viewSource: document.getElementById('viewSource')
        };
    }
    
    bindEvents() {
        // Settings changes
        this.elements.defaultEmbedMode.addEventListener('change', () => {
            this.updateModeText();
            this.saveSettings();
        });
        
        this.elements.defaultCloseTabs.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.elements.defaultCurrentWindowOnly.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Reset button
        this.elements.resetSettings.addEventListener('click', () => {
            this.resetAllSettings();
        });
        
        // Footer links
        this.elements.reportIssue.addEventListener('click', (e) => {
            e.preventDefault();
            this.openLink('https://github.com/your-repo/gathertube/issues');
        });
        
        this.elements.rateExtension.addEventListener('click', (e) => {
            e.preventDefault();
            this.openLink('https://chrome.google.com/webstore/detail/gathertube');
        });
        
        this.elements.viewSource.addEventListener('click', (e) => {
            e.preventDefault();
            this.openLink('https://github.com/your-repo/gathertube');
        });
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get({
                embedMode: false,
                closeTabs: false,
                currentWindowOnly: false
            });
            
            this.elements.defaultEmbedMode.checked = result.embedMode;
            this.elements.defaultCloseTabs.checked = result.closeTabs;
            this.elements.defaultCurrentWindowOnly.checked = result.currentWindowOnly;
            this.updateModeText();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showMessage('Failed to load settings', 'error');
        }
    }
    
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                embedMode: this.elements.defaultEmbedMode.checked,
                closeTabs: this.elements.defaultCloseTabs.checked,
                currentWindowOnly: this.elements.defaultCurrentWindowOnly.checked
            });
            
            this.showMessage('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showMessage('Failed to save settings', 'error');
        }
    }
    
    updateModeText() {
        this.elements.defaultModeText.textContent = 
            this.elements.defaultEmbedMode.checked ? 'Embedded player' : 'watch_videos';
    }
    
    async loadExtensionInfo() {
        try {
            // Load manifest version
            const manifest = chrome.runtime.getManifest();
            this.elements.version.textContent = manifest.version;
            
            // Load queue info
            const result = await chrome.storage.local.get(['currentQueue', 'queueTimestamp']);
            
            if (result.currentQueue && Array.isArray(result.currentQueue)) {
                this.elements.queueSize.textContent = result.currentQueue.length;
            } else {
                this.elements.queueSize.textContent = '0';
            }
            
            if (result.queueTimestamp) {
                const date = new Date(result.queueTimestamp);
                this.elements.lastUpdate.textContent = this.formatDate(date);
            } else {
                this.elements.lastUpdate.textContent = 'Never';
            }
        } catch (error) {
            console.error('Failed to load extension info:', error);
        }
    }
    
    formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    async resetAllSettings() {
        if (!confirm('Are you sure you want to reset all settings and clear queue data? This cannot be undone.')) {
            return;
        }
        
        try {
            await chrome.storage.local.clear();
            
            // Reset form elements
            this.elements.defaultEmbedMode.checked = false;
            this.elements.defaultCloseTabs.checked = false;
            this.elements.defaultCurrentWindowOnly.checked = false;
            this.updateModeText();
            
            // Reload extension info
            this.loadExtensionInfo();
            
            this.showMessage('All settings have been reset to default values', 'success');
        } catch (error) {
            console.error('Failed to reset settings:', error);
            this.showMessage('Failed to reset settings', 'error');
        }
    }
    
    openLink(url) {
        chrome.tabs.create({ url });
    }
    
    showMessage(text, type = 'info') {
        this.elements.messageDiv.textContent = text;
        this.elements.messageDiv.className = `message ${type}`;
        this.elements.messageDiv.style.display = 'block';
        
        // Auto-hide message after 3 seconds
        setTimeout(() => {
            this.elements.messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GatherTubeOptions();
});