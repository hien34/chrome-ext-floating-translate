(function() {
    const WINDOW_ID = 'gemini-floating-translator-window';
    let floatingWindow = document.getElementById(WINDOW_ID);
    
    // Toggle existing window
    if (floatingWindow) {
        const isHidden = floatingWindow.style.display === 'none';
        floatingWindow.style.display = isHidden ? 'flex' : 'none';
        return; 
    }

    // Create new window
    floatingWindow = document.createElement('div');
    floatingWindow.id = WINDOW_ID;
    
    const styles = `
        #${WINDOW_ID} {
            --ft-bg: #ffffff;
            --ft-bg-header: #f3f4f6;
            --ft-text: #1f2937;
            --ft-text-muted: #6b7280;
            --ft-border: #e5e7eb;
            --ft-primary: #2563eb;
            --ft-accent: #9333ea;
            --ft-input-bg: #f9fafb;
            font-family: system-ui, -apple-system, sans-serif;
            position: fixed;
            top: 20px;
            right: 20px;
            width: 360px;
            height: 520px;
            background-color: var(--ft-bg);
            border: 1px solid var(--ft-border);
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: var(--ft-text);
        }
        #${WINDOW_ID}.dark {
            --ft-bg: #111827;
            --ft-bg-header: #1f2937;
            --ft-text: #f3f4f6;
            --ft-text-muted: #9ca3af;
            --ft-border: #6b7280;
            --ft-primary: #3b82f6;
            --ft-accent: #a855f7;
            --ft-input-bg: #1f2937;
        }
        #${WINDOW_ID} * { box-sizing: border-box; }
        
        .ft-header {
            padding: 12px 16px;
            background-color: var(--ft-bg-header);
            border-bottom: 1px solid var(--ft-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            user-select: none;
        }
        .ft-title { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .ft-controls { display: flex; gap: 4px; align-items: center; }
        
        .ft-icon-btn {
            background: transparent; border: none; padding: 6px; border-radius: 4px;
            color: var(--ft-text-muted); cursor: pointer; display: flex;
            align-items: center; justify-content: center;
            overflow: visible;
        }
        .ft-icon-btn svg { overflow: visible; display: block; }
        .ft-icon-btn:hover { background-color: rgba(128,128,128,0.1); color: var(--ft-text); }
        
        .ft-content { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
        
        .ft-settings {
            display: none; flex-direction: column; gap: 8px;
            padding: 12px; background: var(--ft-bg-header);
            border: 1px solid var(--ft-border); border-radius: 8px;
        }
        .ft-input-field {
            width: 100%; padding: 8px; border-radius: 6px;
            border: 1px solid var(--ft-border); background: var(--ft-input-bg);
            color: var(--ft-text); font-size: 13px; outline: none;
        }
        /* Hides text visually like a password field, but prevents browser 'Save Password' prompt */
        #ft-api-input {
            -webkit-text-security: disc;
        }
        .ft-lang-row { display: flex; align-items: center; gap: 8px; }
        .ft-badge {
            flex: 1; text-align: center; padding: 6px; border-radius: 6px;
            background: var(--ft-input-bg); border: 1px solid var(--ft-border);
            font-size: 11px; font-weight: 700;
        }
        textarea.ft-textarea {
            width: 100%; padding: 12px; border-radius: 8px;
            border: 1px solid var(--ft-border); background: var(--ft-input-bg);
            color: var(--ft-text); font-size: 14px; resize: none; outline: none;
        }
        .ft-btn-row { display: flex; gap: 8px; margin-top: auto; }
        .ft-btn {
            flex: 1; padding: 10px; border-radius: 8px; border: none;
            font-weight: 600; font-size: 13px; cursor: pointer; color: white;
        }
        .ft-btn-primary { background-color: var(--ft-primary); }
        .ft-btn-accent { background-color: var(--ft-accent); }
        .ft-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ft-resize-handle {
            position: absolute; bottom: 0; right: 0; width: 16px; height: 16px;
            cursor: nwse-resize; z-index: 10;
        }
        .ft-action-sm-btn {
             position:absolute; bottom:8px; right:8px; padding:4px 8px; font-size:10px; 
             background:var(--ft-bg-header); border:1px solid var(--ft-border); 
             color:var(--ft-text); border-radius:4px; cursor:pointer; z-index: 5;
        }
        .ft-action-sm-btn:hover {
            background-color: rgba(128,128,128,0.1);
        }
    `;

    floatingWindow.innerHTML = `
        <style>${styles}</style>
        <div class="ft-header" id="ft-drag-zone">
            <div class="ft-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:#3b82f6"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
                Translate
            </div>
            <div class="ft-controls">
                <button class="ft-icon-btn" id="ft-theme-btn" title="Toggle Theme">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </button>
                <button class="ft-icon-btn" id="ft-settings-btn" title="Settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
                <button class="ft-icon-btn" id="ft-close-btn" title="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>

        <div class="ft-content">
            <div class="ft-settings" id="ft-settings-panel">
                <div style="font-size:11px; font-weight:700; color:var(--ft-text-muted);">GEMINI API KEY</div>
                <input type="text" id="ft-api-input" class="ft-input-field" placeholder="Paste API Key here...">
                <button id="ft-save-key" class="ft-btn ft-btn-primary" style="padding:6px; font-size:11px;">Save Key</button>
            </div>

            <div class="ft-lang-row">
                <div class="ft-badge" id="ft-source">JAPANESE</div>
                <button class="ft-icon-btn" id="ft-swap-lang">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16l-4-4 4-4m10 0l4 4-4 4m-14-4h18"/></svg>
                </button>
                <div class="ft-badge" id="ft-target">ENGLISH</div>
            </div>

            <div style="position:relative; flex:1; display:flex;">
                <textarea id="ft-input" class="ft-textarea" style="height:100%;" placeholder="Type and press Enter..."></textarea>
                <button id="ft-clear-btn" title="Clear All" class="ft-action-sm-btn" style="top:8px; bottom:auto; right:8px; padding:4px;">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div style="position:relative; flex:1.5; display:flex;">
                <textarea id="ft-output" class="ft-textarea" style="height:100%;" placeholder="Result..." readonly></textarea>
                <button id="ft-copy" class="ft-action-sm-btn">Copy</button>
            </div>

            <div class="ft-btn-row">
                <button id="ft-kanji-btn" class="ft-btn ft-btn-accent">Kanji / Kana</button>
                <button id="ft-translate-btn" class="ft-btn ft-btn-primary">Translate</button>
            </div>
        </div>
        <div class="ft-resize-handle" id="ft-resize"></div>
    `;

    document.body.appendChild(floatingWindow);

    // --- References ---
    const dragZone = document.getElementById('ft-drag-zone');
    const closeBtn = document.getElementById('ft-close-btn');
    const settingsBtn = document.getElementById('ft-settings-btn');
    const settingsPanel = document.getElementById('ft-settings-panel');
    const themeBtn = document.getElementById('ft-theme-btn');
    const inputEl = document.getElementById('ft-input');
    const outputEl = document.getElementById('ft-output');
    const transBtn = document.getElementById('ft-translate-btn');
    const kanjiBtn = document.getElementById('ft-kanji-btn');
    const apiInput = document.getElementById('ft-api-input');
    const saveKeyBtn = document.getElementById('ft-save-key');
    const swapBtn = document.getElementById('ft-swap-lang');
    const sourceEl = document.getElementById('ft-source');
    const targetEl = document.getElementById('ft-target');
    const copyBtn = document.getElementById('ft-copy');
    const clearBtn = document.getElementById('ft-clear-btn');

    // --- State ---
    let sourceLang = 'ja';
    let targetLang = 'en';

    // --- Init ---
    chrome.storage.sync.get(['geminiTheme', 'geminiApiKey'], (data) => {
        if (data.geminiTheme === 'dark') floatingWindow.classList.add('dark');
        if (data.geminiApiKey) apiInput.value = data.geminiApiKey;
    });

    // --- Event Listeners ---
    themeBtn.addEventListener('click', () => {
        floatingWindow.classList.toggle('dark');
        chrome.storage.sync.set({ geminiTheme: floatingWindow.classList.contains('dark') ? 'dark' : 'light' });
    });

    closeBtn.addEventListener('click', () => floatingWindow.style.display = 'none');

    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'flex' ? 'none' : 'flex';
    });

    saveKeyBtn.addEventListener('click', () => {
        const key = apiInput.value.trim();
        chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey: key }, () => {
            saveKeyBtn.textContent = 'Saved!';
            setTimeout(() => { 
                saveKeyBtn.textContent = 'Save Key'; 
                settingsPanel.style.display = 'none';
            }, 1000);
        });
    });

    swapBtn.addEventListener('click', () => {
        [sourceLang, targetLang] = [targetLang, sourceLang];
        sourceEl.textContent = sourceLang === 'ja' ? 'JAPANESE' : 'ENGLISH';
        targetEl.textContent = targetLang === 'en' ? 'ENGLISH' : 'JAPANESE';
    });

    // Clear Button Logic
    clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        outputEl.value = '';
        inputEl.focus();
    });

    const triggerTranslate = (mode) => {
        const text = inputEl.value.trim();
        if(!text) return;
        
        outputEl.value = 'Translating...';
        transBtn.disabled = true;
        kanjiBtn.disabled = true;

        try {
            chrome.runtime.sendMessage({
                action: mode === 'kanji' ? 'translateTextKanji' : 'translateText',
                text, sourceLang, targetLang
            }, (res) => {
                if (chrome.runtime.lastError) {
                    outputEl.value = 'Error: ' + (chrome.runtime.lastError.message || 'Unknown error');
                    transBtn.disabled = false;
                    kanjiBtn.disabled = false;
                    return;
                }
                
                if (!res) {
                    outputEl.value = 'Error: No response from extension.';
                    transBtn.disabled = false;
                    kanjiBtn.disabled = false;
                    return;
                }

                outputEl.value = res.status === 'success' ? res.translatedText : (res.message || 'Error');
                transBtn.disabled = false;
                kanjiBtn.disabled = false;
            });
        } catch (e) {
            console.error(e);
            outputEl.value = 'Extension updated/reloaded. Please refresh the page.';
            transBtn.disabled = false;
            kanjiBtn.disabled = false;
        }
    };

    transBtn.addEventListener('click', () => triggerTranslate('standard'));
    kanjiBtn.addEventListener('click', () => triggerTranslate('kanji'));
    
    inputEl.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            triggerTranslate('standard');
        }
    });

    copyBtn.addEventListener('click', () => {
        outputEl.select();
        document.execCommand('copy');
        copyBtn.textContent = 'COPIED!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    });

    // --- Drag Logic ---
    let isDragging = false;
    let dragOffset = {x:0, y:0};

    dragZone.addEventListener('mousedown', (e) => {
        if(e.target.closest('button')) return;
        isDragging = true;
        dragOffset.x = e.clientX - floatingWindow.offsetLeft;
        dragOffset.y = e.clientY - floatingWindow.offsetTop;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        floatingWindow.style.left = (e.clientX - dragOffset.x) + 'px';
        floatingWindow.style.top = (e.clientY - dragOffset.y) + 'px';
        // Ensure right isn't anchored, allowing free movement
        floatingWindow.style.right = 'auto'; 
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });
})();