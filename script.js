// This script runs when the extension icon is clicked (Popup).

// Immediate visual feedback to prevent "white box" confusion
document.body.style.fontFamily = "system-ui, sans-serif";
document.body.style.fontSize = "13px";
document.body.style.padding = "10px";
document.body.style.width = "200px";
document.body.style.textAlign = "center";
document.body.innerHTML = '<div>Launching...</div>';

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // Check for restricted URLs
    if (!currentTab || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('edge://') || currentTab.url.startsWith('about:') || currentTab.url.startsWith('chrome-extension://')) {
        document.body.innerHTML = '<div style="color:#e11d48; font-weight:600;">Cannot run here.</div><div style="margin-top:8px; color:#666;">Try on a regular web page.</div>';
        return;
    }

    if (currentTab.id) {
        chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content_script.js']
        }, () => {
            if (chrome.runtime.lastError) {
                document.body.innerHTML = `<div style="color:red;">Error: ${chrome.runtime.lastError.message}</div>`;
            } else {
                // visual confirmation before closing
                document.body.innerHTML = '<div style="color:#059669; font-weight:600;">Active!</div>';
                setTimeout(() => {
                    window.close();
                }, 800);
            }
        });
    }
});