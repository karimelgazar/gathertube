// Options JavaScript for GatherTube extension - Firefox Compatible
// Uses browser.* APIs with chrome.* fallback for cross-browser compatibility

// Cross-browser API compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class GatherTubeOptions {
    constructor() {
        this.embedModeCheckbox = document.getElementById('embedMode');
        this.closeTabsCheckbox = document.getElementById('closeTabs');
        this.sortOrderSelect = document.getElementById('sortOrder');
        this.saveBtn = document.getElementById('saveBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.messageDiv = document.getElementById('message');
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.bindEvents();
        this.updateVersionInfo();
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
            
            this.showMessage('Settings saved successfully!', 'success');
        } catch (error) {
            this.showMessage('Failed to save settings', 'error');
        }
    }
    
    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            try {
                await browserAPI.storage.local.clear();
                
                // Set default values
                await browserAPI.storage.local.set({
                    embedMode: false,
                    closeTabs: false,
                    sortOrder: 'newest'
                });
                
                // Reload settings to update UI
                await this.loadSettings();
                
                this.showMessage('Settings reset to defaults successfully!', 'success');
            } catch (error) {
                this.showMessage('Failed to reset settings', 'error');
            }
        }
    }
    
    bindEvents() {
        // Save button click
        this.saveBtn.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Reset button click
        this.resetBtn.addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Auto-save on change
        this.embedModeCheckbox.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.closeTabsCheckbox.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.sortOrderSelect.addEventListener('change', () => {
            this.saveSettings();
        });
    }
    
    updateVersionInfo() {
        // Get manifest info
        const manifest = browserAPI.runtime.getManifest();
        const versionElement = document.getElementById('version');
        const nameElement = document.getElementById('extensionName');
        
        if (versionElement) {
            versionElement.textContent = manifest.version;
        }
        
        if (nameElement) {
            nameElement.textContent = manifest.name;
        }
    }
    
    showMessage(text, type = 'info') {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';
        
        // Auto-hide messages after 3 seconds
        setTimeout(() => {
            this.hideMessage();
        }, 3000);
    }
    
    hideMessage() {
        this.messageDiv.style.display = 'none';
    }
}

// Initialize options when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GatherTubeOptions();
});