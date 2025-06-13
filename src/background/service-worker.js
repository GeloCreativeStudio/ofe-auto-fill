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
        chrome.storage.local.get(['showNotifications'], (settings) => {
            // Default to true if the setting is not explicitly false
            if (settings.showNotifications !== false && chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/android-chrome-192x192.png', // Ensure this path is correct
                    title: 'OFE Auto-fill',
                    message: `Successfully filled ${request.count} evaluation fields!`
                }).catch(error => {
                    // Silently fail - notification is not critical for extension functionality
                });
            }
        });
    }
    // sendResponse should be called consistently. Since storage.get is async,
    // if we need to wait for it for some reason, we'd return true here.
    // But for this specific case, sendResponse is just ack'ing the message receipt.
    sendResponse({ success: true }); 
    // To be safe and allow async operations within the listener before a potential sendResponse,
    // it's good practice to return true if any async path might exist for sendResponse.
    // However, if sendResponse is always called synchronously like this, it's not strictly needed.
    // For this change, since sendResponse is outside the async storage call, it's fine.
    // If sendResponse were INSIDE the storage.get callback, then returning true would be mandatory.
    return true; // Indicate that sendResponse might be called asynchronously if it were structured differently.
                 // For the current structure, this is more of a best practice for future changes.
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