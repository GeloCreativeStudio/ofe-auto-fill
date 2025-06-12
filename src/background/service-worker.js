// OFE Auto-fill Service Worker

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'evaluationCompleted') {
        // Check if notifications are supported and enabled
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/android-chrome-192x192.png',
                title: 'OFE Auto-fill',
                message: `Successfully filled ${request.count} evaluation fields!`
            }).catch(error => {
                // Silently fail - notification is not critical for extension functionality
            });
        }
    }
    sendResponse({ success: true });
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.local.set({
            defaultRating: 'excellent',
            autoFillEnabled: true,
            showNotifications: true,
            fillDelay: 100,
            skipFilledFields: true
        });
    }
});