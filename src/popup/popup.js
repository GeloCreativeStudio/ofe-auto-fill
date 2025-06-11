document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const statusIcon = statusDiv.querySelector('.status-icon i');
    const statusText = statusDiv.querySelector('.status-text');
    const autoFillBtn = document.getElementById('autoFillBtn');
    const previewBtn = document.getElementById('previewBtn');
    const pageRefreshBtn = document.getElementById('refreshBtn');
    const customDropdown = document.getElementById('custom-dropdown');
    const dropdownDisplay = document.getElementById('dropdown-display');
    const dropdownOptions = document.getElementById('dropdown-options');
    const selectedOption = document.getElementById('selected-option');
    
    let currentTab = null;
    let currentRatingLevel = 'excellent'; // Default rating level
    let isDropdownOpen = false;
    let hasAutoFilled = false; // Track if auto-fill has been used
    let lastUsedRatingLevel = null; // Track the last rating level used for auto-fill    // Simplified status messages
    function showBriefStatus(message, duration = 2000, type = 'success') {
        const originalText = statusText.textContent;
        const originalClass = statusDiv.className;
        const originalIcon = statusIcon.className;
        
        // Update status without animation
        statusText.textContent = message;
        statusDiv.className = `status-card ${type === 'success' ? 'ready' : 'not-ready'}`;
        statusIcon.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
        
        setTimeout(() => {
            statusText.textContent = originalText;
            statusDiv.className = originalClass;
            statusIcon.className = originalIcon;
        }, duration);
    }

    // Enhanced button state management
    function updateButtonStates(isOnCorrectPage, isContentScriptReady) {
        if (isOnCorrectPage && isContentScriptReady) {
            autoFillBtn.disabled = false;
            previewBtn.disabled = false;
            autoFillBtn.classList.remove('loading');
            previewBtn.classList.remove('loading');
        } else {
            autoFillBtn.disabled = true;
            previewBtn.disabled = true;
        }
    }

    function updateAutoFillButton(state, messageText = null, count = null, preventTimeout = false) {
        const iconMapping = {
            default: 'fas fa-rocket',
            loading: 'fas fa-spinner fa-spin',
            success: 'fas fa-check',
            error: 'fas fa-exclamation-triangle',
            disabled: 'fas fa-ban',
            refresh: 'fas fa-sync-alt'
        };

        let baseMessage;
        const buttonContent = autoFillBtn.querySelector('.button-content');
        const buttonIcon = buttonContent.querySelector('i');
        const buttonText = buttonContent.querySelector('span');
            // Clear any existing timeouts
        if (window.autoFillButtonTimeout) {
            clearTimeout(window.autoFillButtonTimeout);
            window.autoFillButtonTimeout = null;
        }

        switch(state) {
            case 'default':
                baseMessage = messageText || 'Auto-Fill Evaluation';
                autoFillBtn.disabled = false;
                previewBtn.disabled = false;
                autoFillBtn.classList.remove('success', 'error', 'loading');
                break;
            case 'loading':
                baseMessage = messageText || 'Filling...';
                autoFillBtn.disabled = true;
                previewBtn.disabled = true;
                autoFillBtn.classList.add('loading');
                autoFillBtn.classList.remove('success', 'error');
                break;
            case 'success':
                baseMessage = messageText || `Filled ${count} fields!`;
                autoFillBtn.disabled = true; 
                previewBtn.disabled = false;
                autoFillBtn.classList.add('success');
                autoFillBtn.classList.remove('loading', 'error');
                  if (!preventTimeout) {
                    // Show helpful message about changing ratings
                    setTimeout(() => {
                        showBriefStatus('You can change rating level and auto-fill again', 4000);
                    }, 1000);
                    
                    // Reset button after 3 seconds
                    window.autoFillButtonTimeout = setTimeout(() => {
                        buttonIcon.className = iconMapping.default;
                        buttonText.textContent = 'Auto-Fill Evaluation';
                        autoFillBtn.disabled = false;
                        previewBtn.disabled = false;
                        autoFillBtn.classList.remove('success', 'error', 'loading');
                    }, 3000);
                }
                break;
            case 'error':
                baseMessage = messageText || 'Error occurred';
                autoFillBtn.disabled = false;
                previewBtn.disabled = false;
                autoFillBtn.classList.add('error');
                autoFillBtn.classList.remove('loading', 'success');
                
                if (!preventTimeout) {
                    // Reset button after 3 seconds
                    window.autoFillButtonTimeout = setTimeout(() => {
                        buttonIcon.className = iconMapping.default;
                        buttonText.textContent = 'Auto-Fill Evaluation';
                        autoFillBtn.disabled = false;
                        previewBtn.disabled = false;
                        autoFillBtn.classList.remove('success', 'error', 'loading');
                    }, 3000);
                }
                break;
            case 'disabled': 
                baseMessage = messageText || 'Not on evaluation page';
                autoFillBtn.disabled = true;
                previewBtn.disabled = true;
                autoFillBtn.classList.remove('success', 'error', 'loading');
                break;
            case 'refresh': 
                baseMessage = messageText || 'Please refresh page';
                autoFillBtn.disabled = true;
                previewBtn.disabled = true;
                autoFillBtn.classList.remove('success', 'error', 'loading');
                break;
            default:
                baseMessage = 'Auto-Fill Evaluation';
                autoFillBtn.disabled = false;
                previewBtn.disabled = false;
                autoFillBtn.classList.remove('success', 'error', 'loading');
        }
        
        buttonIcon.className = iconMapping[state] || iconMapping['default'];
        buttonText.textContent = baseMessage;
    }      // Simplified rating level icons and text mapping
    const ratingIcons = {
        excellent: { icon: 'fas fa-star', color: '#10b981', text: 'Excellent (5/Outstanding)' },
        good: { icon: 'fas fa-thumbs-up', color: '#3b82f6', text: 'Good (4/Above Average)' },
        average: { icon: 'fas fa-minus-circle', color: '#f59e0b', text: 'Average (3/Moderate)' },
        belowAverage: { icon: 'fas fa-thumbs-down', color: '#ef4444', text: 'Below Average (2/Disagree)' },
        poor: { icon: 'fas fa-frown', color: '#8b5cf6', text: 'Poor (1/Strongly Disagree)' },
        notApplicable: { icon: 'fas fa-times-circle', color: '#6b7280', text: 'Not Applicable (0/N/A)' }
    };    // Enhanced status update function
    function updateStatus(message, type = 'checking', showRefresh = false) {
        statusText.textContent = message;
        
        // Update status card class and icon
        switch(type) {
            case 'ready':
                statusDiv.className = 'status-card ready';
                statusIcon.className = 'fas fa-check-circle';
                break;
            case 'not-ready':
                statusDiv.className = 'status-card not-ready';
                statusIcon.className = 'fas fa-exclamation-triangle';
                break;
            case 'checking':
            default:
                statusDiv.className = 'status-card';
                statusIcon.className = 'fas fa-circle-notch fa-spin';
                break;
        }
        
        // Always show refresh button for not-ready states (warning messages)
        if (pageRefreshBtn) {
            pageRefreshBtn.style.display = (type === 'not-ready' || showRefresh) ? 'flex' : 'none';
        }
    }
      // Helper function to check if content script is available
    async function isContentScriptReady(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            return response?.success === true;
        } catch (error) {
            return false;
        }
    }
    
    // Check if we're on the correct page and setup UI
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;
        
        const isOnEvaluationPage = tab.url && tab.url.includes('solar.feutech.edu.ph/online/faculty/evaluation');
          if (isOnEvaluationPage) {
            const isReady = await isContentScriptReady(tab.id);
            if (isReady) {
                updateStatus('Ready to auto-fill', 'ready');
                updateAutoFillButton('default');
                updateButtonStates(true, true);            } else {
                updateStatus('Page not fully loaded. Please refresh.', 'not-ready');
                updateAutoFillButton('refresh', 'Refresh page to use');
                updateButtonStates(true, false);
                
                // Setup refresh button listener
                if (pageRefreshBtn) {
                    const newPageRefreshBtn = pageRefreshBtn.cloneNode(true);
                    pageRefreshBtn.parentNode.replaceChild(newPageRefreshBtn, pageRefreshBtn);
                    newPageRefreshBtn.addEventListener('click', () => {
                        if (currentTab?.id) chrome.tabs.reload(currentTab.id);
                        window.close();
                    });
                }        }} else {
            updateStatus('Not on Online Faculty Evaluation page', 'not-ready');
            updateAutoFillButton('disabled', 'Navigate to evaluation page');
            updateButtonStates(false, false);
        }
    } catch (error) {
        updateStatus('Error checking page status', 'not-ready');
        updateAutoFillButton('error', 'Error checking page');
        updateButtonStates(false, false);
    }
      // Load saved rating level
    try {
        const result = await chrome.storage.local.get(['defaultRating']);
        const savedRating = result.defaultRating || 'excellent';
        currentRatingLevel = savedRating;
        
        // Update the custom dropdown display with enhanced styling
        const rating = ratingIcons[currentRatingLevel];
        if (rating && selectedOption) {
            const ratingIcon = selectedOption.querySelector('.rating-icon');
            const ratingText = selectedOption.querySelector('.rating-text');
            
            if (ratingIcon && ratingText) {
                ratingIcon.className = `${rating.icon} rating-icon ${currentRatingLevel}`;
                ratingText.textContent = rating.text;
            }
        }
    } catch (error) {
    }      // Simplified dropdown functionality
    dropdownDisplay.addEventListener('click', (e) => {
        e.preventDefault();
        isDropdownOpen = !isDropdownOpen;
        
        if (isDropdownOpen) {
            dropdownOptions.style.display = 'block';
        } else {
            dropdownOptions.style.display = 'none';
        }
    });      // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customDropdown.contains(e.target) && isDropdownOpen) {
            isDropdownOpen = false;
            dropdownOptions.style.display = 'none';
        }
    });// Simplified option selection
    const dropdownOptionElements = dropdownOptions.querySelectorAll('.dropdown-option');
    dropdownOptionElements.forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const value = option.getAttribute('data-value');
            const rating = ratingIcons[value];
            
            // Update display
            const ratingIcon = selectedOption.querySelector('.rating-icon');
            const ratingText = selectedOption.querySelector('.rating-text');
            
            if (ratingIcon && ratingText) {
                ratingIcon.className = `${rating.icon} rating-icon ${value}`;
                ratingText.textContent = rating.text;
            }
            
            // Update current rating level
            currentRatingLevel = value;
            
            // Close dropdown
            isDropdownOpen = false;
            dropdownOptions.style.display = 'none';
            const arrow = dropdownDisplay.querySelector('.dropdown-arrow');
            arrow.style.transform = 'rotate(0deg)';
              // Reset auto-fill button when rating changes
            if (autoFillBtn.classList.contains('success') || autoFillBtn.classList.contains('error')) {
                updateAutoFillButton('default', null, null, true);
                showBriefStatus('Rating changed to ' + rating.text.split(' (')[0] + '. Ready to auto-fill again.');
            }
            
            try {
                // Save to storage
                await chrome.storage.local.set({ defaultRating: currentRatingLevel });
            } catch (error) {
            }
        });
    });
      // Enhanced auto-fill button click handler
    autoFillBtn.addEventListener('click', async () => {
        if (!currentTab?.id) {
            updateAutoFillButton('error', 'Tab information missing');
            return;
        }        if (!currentTab?.url?.includes('solar.feutech.edu.ph/online/faculty/evaluation')) {
            updateAutoFillButton('disabled', 'Not on evaluation page');
            updateStatus('Not on Online Faculty Evaluation page', 'not-ready');
            return;
        }

        // Ping content script again just before attempting to fill
        const isReady = await isContentScriptReady(currentTab.id);        if (!isReady) {
            updateAutoFillButton('refresh', 'Refresh page to use');
            updateStatus('Content script not responding', 'not-ready');
            
            if (pageRefreshBtn) {
                const newPageRefreshBtn = pageRefreshBtn.cloneNode(true);
                pageRefreshBtn.parentNode.replaceChild(newPageRefreshBtn, pageRefreshBtn);
                newPageRefreshBtn.addEventListener('click', () => {
                    if (currentTab?.id) chrome.tabs.reload(currentTab.id);
                    window.close();
                });
            }
            return;
        }

        try {
            updateAutoFillButton('loading', 'Filling...');
            
            // Always force refill if we've already auto-filled before (user wants to change ratings)
            const needsForceRefill = hasAutoFilled;
              const response = await chrome.tabs.sendMessage(currentTab.id, { 
                action: 'autoFill',
                ratingLevel: currentRatingLevel,
                forceRefill: needsForceRefill
            });
            
            if (response && response.success) {
                updateAutoFillButton('success', `Filled ${response.count} fields!`, response.count);
                hasAutoFilled = true;
                lastUsedRatingLevel = currentRatingLevel;
                
                // Show success animation
                showBriefStatus('Successfully filled ' + response.count + ' evaluation fields', 3000, 'success');
            } else {
                updateAutoFillButton('error', response?.message || 'Failed to fill (no response)');
                showBriefStatus('Failed to fill evaluation form', 2000, 'error');
            }        } catch (error) {
              if (error.message.includes('Receiving end does not exist')) {
                updateAutoFillButton('refresh', 'Refresh page to use');
                updateStatus('Connection lost', 'not-ready');
                
                if (pageRefreshBtn) {
                    const newPageRefreshBtn = pageRefreshBtn.cloneNode(true);
                    pageRefreshBtn.parentNode.replaceChild(newPageRefreshBtn, pageRefreshBtn);
                    newPageRefreshBtn.addEventListener('click', () => {
                        if (currentTab?.id) chrome.tabs.reload(currentTab.id);
                        window.close();
                    });
                }
            } else {
                updateAutoFillButton('error', error.message || 'An error occurred');
                showBriefStatus('An error occurred during auto-fill', 2000, 'error');
            }        }
    });
    
    // Enhanced preview button click handler
    previewBtn.addEventListener('click', async () => {
        if (!currentTab?.id) {
            showBriefStatus('Tab information missing', 2000, 'error');
            return;
        }        if (!currentTab?.url?.includes('solar.feutech.edu.ph/online/faculty/evaluation')) {
            showBriefStatus('Not on Online Faculty Evaluation page', 2000, 'error');
            return;
        }

        // Add button animation
        previewBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            previewBtn.style.transform = 'scale(1)';
        }, 100);        // Ping content script again just before attempting to preview
        const isReady = await isContentScriptReady(currentTab.id);
        if (!isReady) {
            showBriefStatus('Content script not responding. Please refresh the page.', 3000, 'error');
            return;
        }

        try {
            // Show loading state on preview button
            const buttonContent = previewBtn.querySelector('.button-content');
            const buttonIcon = buttonContent.querySelector('i');
            const buttonText = buttonContent.querySelector('span');
            const originalIcon = buttonIcon.className;
            const originalText = buttonText.textContent;
            
            buttonIcon.className = 'fas fa-spinner fa-spin';
            buttonText.textContent = 'Generating Preview...';
            previewBtn.disabled = true;
            
            // Always force refill for preview if we've already auto-filled before
            const needsForceRefill = hasAutoFilled;
            
            const response = await chrome.tabs.sendMessage(currentTab.id, { 
                action: 'preview',
                ratingLevel: currentRatingLevel,
                forceRefill: needsForceRefill
            });
            
            // Reset button state
            buttonIcon.className = originalIcon;
            buttonText.textContent = originalText;
            previewBtn.disabled = false;
              if (response && response.success && response.preview) {
                const preview = response.preview;
                const rating = ratingIcons[currentRatingLevel];
                
                let message = 'Preview for ' + rating.text.split(' (')[0] + ':\n\n';
                message += 'Will fill ' + preview.count + ' out of ' + preview.total + ' fields\n\n';
                
                if (preview.count > 0) {
                    message += 'Sample selections:\n';
                    let sampleCount = 0;
                    for (const item of preview.data) {
                        if (item.matched && sampleCount < 5) {
                            message += '• Field ' + (item.index + 1) + ': "' + item.wouldSelect + '"\n';
                            sampleCount++;
                        }
                    }
                    if (preview.count > 5) {
                        message += '... and ' + (preview.count - 5) + ' more fields\n';
                    }
                } else {
                    message += 'No fields would be filled with the current rating level.';
                }
                
                const skippedCount = preview.data.filter(item => item.alreadyFilled).length;
                if (skippedCount > 0) {
                    message += '\n\n' + skippedCount + ' fields already filled (will be skipped)';
                }
                
                // Enhanced alert with better formatting
                alert(message);
                showBriefStatus('Preview generated successfully', 2000, 'success');
            } else {
                showBriefStatus('Failed to generate preview', 2000, 'error');
            }
        } catch (error) {
            
            // Reset button state on error
            const buttonContent = previewBtn.querySelector('.button-content');
            const buttonIcon = buttonContent.querySelector('i');
            const buttonText = buttonContent.querySelector('span');
            buttonIcon.className = 'fas fa-eye';
            buttonText.textContent = 'Preview Selection';
            previewBtn.disabled = false;
            
            showBriefStatus('Error generating preview: ' + (error.message || 'Unknown error'), 3000, 'error');
        }
    });
      // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isDropdownOpen) {
            isDropdownOpen = false;
            dropdownOptions.style.display = 'none';
            const arrow = dropdownDisplay.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
        
        if (e.key === 'Enter' && document.activeElement === dropdownDisplay) {
            dropdownDisplay.click();
        }
    });
    
    // Add general refresh button event listener
    if (pageRefreshBtn) {
        pageRefreshBtn.addEventListener('click', () => {
            if (currentTab?.id) {
                chrome.tabs.reload(currentTab.id);
                window.close();
            }
        });
    }
    
    // Add focus indicators for better accessibility
    dropdownDisplay.setAttribute('tabindex', '0');
    autoFillBtn.setAttribute('tabindex', '0');
    previewBtn.setAttribute('tabindex', '0');
});