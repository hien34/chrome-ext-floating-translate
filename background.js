const GEMINI_MODEL = "gemini-3-flash-preview";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Use exponential backoff for retries
async function fetchWithRetry(url, options, maxRetries = 3) {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && i < maxRetries - 1) {
                // Rate limit
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
                continue;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1. Save API Key
    if (request.action === 'saveApiKey') {
        chrome.storage.sync.set({ 'geminiApiKey': request.apiKey }, () => {
            sendResponse({ status: 'success' });
        });
        return true;
    }

    // 2. Translation Actions
    if (request.action === 'translateText' || request.action === 'translateTextKanji') {
        (async () => {
            try {
                const data = await chrome.storage.sync.get(['geminiApiKey']);
                const apiKey = data.geminiApiKey;

                if (!apiKey) {
                    sendResponse({ status: 'error', message: 'Missing API Key. Please open settings.' });
                    return;
                }

                const sourceLangText = request.sourceLang === 'ja' ? 'Japanese' : 'English';
                const targetLangText = request.targetLang === 'en' ? 'English' : 'Japanese';
                const direction = `${sourceLangText} to ${targetLangText}`;

                let systemPrompt = "";
                if (request.action === 'translateTextKanji') {
                    systemPrompt = `You are a Japanese linguistic assistant. 
1. Translate the text from ${sourceLangText} to ${targetLangText}.
2. Add a new line.
3. Identify the original Kanji used in the source text and provide their Hiragana readings in the format "Kanji = Hiragana", one per line.`;
                } else {
                    systemPrompt = `You are a professional translator. Provide only the direct translation from ${direction}. No conversational filler.`;
                }

                const payload = {
                    contents: [{ parts: [{ text: request.text }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.3
                    },
                    // Disable thinking for faster responses
                    thinkingConfig: {
                        thinkingBudget: 0
                    }
                };

                const url = `${API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

                console.time('Gemini API Call');
                const response = await fetchWithRetry(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                console.timeEnd('Gemini API Call');

                const result = await response.json();
                const translatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (translatedText) {
                    sendResponse({ status: 'success', translatedText });
                } else {
                    sendResponse({ status: 'error', message: 'No translation returned.' });
                }
            } catch (error) {
                console.error('Translation Error:', error);
                sendResponse({ status: 'error', message: error.message || 'Network error' });
            }
        })();
        return true; // Keep channel open for async response
    }
});