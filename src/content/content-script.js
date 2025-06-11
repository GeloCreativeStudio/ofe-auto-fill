// Auto-fill OFE (Online Faculty Evaluation) form with customizable ratings
(() => {
    // Define all possible rating options from the evaluation form
    const ratingOptions = {
        excellent: {
            label: "Excellent Ratings",
            choices: ["5", "OUTSTANDING", "STRONGLY AGREE"]
        },
        good: {
            label: "Good Ratings", 
            choices: ["4", "ABOVE AVERAGE", "AGREE"]
        },
        average: {
            label: "Average Ratings",
            choices: ["3", "AVERAGE", "MODERATELY AGREE", "SOMEHOW AGREE"]
        },
        belowAverage: {
            label: "Below Average Ratings",
            choices: ["2", "BELOW AVERAGE", "DISAGREE", "QUITE DISAGREE"]
        },
        poor: {
            label: "Poor Ratings",
            choices: ["1", "POOR", "STRONGLY DISAGREE"]
        },
        notApplicable: {
            label: "Not Applicable",
            choices: ["0", "NOT APPLICABLE"]
        }
    };
      let currentRatingLevel = 'excellent'; // Default to excellent
    let extensionSettings = {
        autoFillEnabled: true,
        fillDelay: 100,
        skipFilledFields: true
    };
    
    // Load extension settings
    // Note: Settings are loaded when the content script is injected. A page reload is required for new settings from the popup to take effect.
    function loadSettings() {
        chrome.storage.local.get([
            'defaultRating', 'autoFillEnabled', 
            'fillDelay', 'skipFilledFields'
        ], (result) => {
            currentRatingLevel = result.defaultRating || 'excellent';
            extensionSettings = {
                autoFillEnabled: result.autoFillEnabled !== undefined ? result.autoFillEnabled : true,
                fillDelay: result.fillDelay || 100,
                skipFilledFields: result.skipFilledFields !== undefined ? result.skipFilledFields : true
            };
        });
    }    // Function to auto-fill the evaluation form
    function autoFillEvaluation(ratingLevel = 'excellent', callback = null, forceRefill = false) {
        if (!extensionSettings.autoFillEnabled) {
            if (callback) callback(0);
            return Promise.resolve(0);
        }
    
        const selects = document.getElementsByTagName('select');
        const choicesToMatch = new Set(ratingOptions[ratingLevel].choices);
        let filledCount = 0;
        const selectArray = Array.from(selects);
        let processedCount = 0; // Counter for processed selects
        let skippedCount = 0; // Counter for skipped selects
    
        return new Promise((resolve) => {
            if (selectArray.length === 0) {
                if (callback) callback(0);
                resolve(0);
                return;
            }

            selectArray.forEach((select, index) => {
                setTimeout(() => {
                    let matched = false;
        
                    // Skip filled fields only if forceRefill is false and skipFilledFields is enabled
                    if (!forceRefill && extensionSettings.skipFilledFields && select.value &&
                        select.value !== "Select Rating" && select.selectedIndex > 0) {
                        // Skip if already filled (only when not forcing refill)
                        skippedCount++;
                    } else {
                        for (const option of select.options) {
                            const optionText = option.text.trim().toUpperCase();
                            const optionValue = option.value.trim().toUpperCase(); // Also check value
        
                            if (choicesToMatch.has(optionText) || choicesToMatch.has(optionValue)) {
                                option.selected = true;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                matched = true;
                                filledCount++;
                                break;
                            }
                        }
                        
                        // Specific numeric '5' check for 'excellent' if not already matched by text/value.
                        if (!matched && ratingLevel === 'excellent') {
                            for (const option of select.options) {
                                if (option.text.trim() === '5' || option.value.trim() === '5') {
                                    option.selected = true;
                                    select.dispatchEvent(new Event('change', { bubbles: true }));
                                    matched = true;
                                    filledCount++;
                                    break;
                                }
                            }
                        }
                        
                        if (!matched) {
                        }
                    }                    processedCount++;                    if (processedCount === selectArray.length) {
                        // All selects processed, now send the message
                        chrome.runtime.sendMessage({
                            action: 'evaluationCompleted',
                            count: filledCount,
                            ratingLevel: ratingOptions[ratingLevel].label
                        }).catch(error => {
                            // Continue execution even if notification fails
                        });
                        
                        if (callback) callback(filledCount);
                        resolve(filledCount);
                    }
                }, index * extensionSettings.fillDelay);
            });
        });
    }    // Function to preview what would be selected (without actually filling)
    function previewSelection(ratingLevel = 'excellent', forceRefill = false) {
        const selects = document.getElementsByTagName('select');
        const choicesToMatch = new Set(ratingOptions[ratingLevel].choices);
        let previewCount = 0;
        const previewData = [];
        
        Array.from(selects).forEach((select, index) => {
            let matched = false;
            let matchedOption = null;
            
            // Skip filled fields only if forceRefill is false and skipFilledFields is enabled
            if (!forceRefill && extensionSettings.skipFilledFields && select.value &&
                select.value !== "Select Rating" && select.selectedIndex > 0) {
                // Skip if already filled (only when not forcing refill)
                previewData.push({
                    index: index,
                    alreadyFilled: true,
                    currentValue: select.value,
                    wouldSelect: null
                });
            } else {
                for (const option of select.options) {
                    const optionText = option.text.trim().toUpperCase();
                    const optionValue = option.value.trim().toUpperCase();
                    
                    if (choicesToMatch.has(optionText) || choicesToMatch.has(optionValue)) {
                        matched = true;
                        matchedOption = option.text;
                        previewCount++;
                        break;
                    }
                }
                
                // Specific numeric '5' check for 'excellent' if not already matched
                if (!matched && ratingLevel === 'excellent') {
                    for (const option of select.options) {
                        if (option.text.trim() === '5' || option.value.trim() === '5') {
                            matched = true;
                            matchedOption = option.text;
                            previewCount++;
                            break;
                        }
                    }
                }
                
                previewData.push({
                    index: index,
                    alreadyFilled: false,
                    currentValue: select.value,
                    wouldSelect: matchedOption,
                    matched: matched
                });
            }
        });
        
        return {
            count: previewCount,
            total: selects.length,
            data: previewData,
            ratingLevel: ratingOptions[ratingLevel].label
        };
    }
      // Load extension settings and initialize
    loadSettings();
      // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            // Simple ping to check if content script is ready
            sendResponse({ success: true });        } else if (request.action === 'autoFill') {
            // Use the promise-based version with forceRefill parameter
            const forceRefill = request.forceRefill || false;
            autoFillEvaluation(request.ratingLevel || currentRatingLevel, null, forceRefill)
                .then(count => {
                    sendResponse({ success: true, count: count });
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Indicate we'll send response asynchronously
        } else if (request.action === 'preview') {
            const forceRefill = request.forceRefill || false;
            const previewResult = previewSelection(request.ratingLevel || currentRatingLevel, forceRefill);
            sendResponse({ success: true, preview: previewResult });
        }
        
        // Return true to indicate we'll send a response asynchronously if needed
        return true;
    });
})();