const GEMINI_MODEL = "gemini-2.5-flash-lite";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Cache API key to avoid storage lookups on every request
let cachedApiKey = null;
chrome.storage.sync.get(['geminiApiKey'], (data) => {
    cachedApiKey = data.geminiApiKey || null;
});
chrome.storage.onChanged.addListener((changes) => {
    if (changes.geminiApiKey) cachedApiKey = changes.geminiApiKey.newValue || null;
});

async function getApiKey() {
    if (cachedApiKey) return cachedApiKey;
    const data = await chrome.storage.sync.get(['geminiApiKey']);
    cachedApiKey = data.geminiApiKey || null;
    return cachedApiKey;
}

function buildPrompt(action, sourceLang, targetLang) {
    const sourceLangText = sourceLang === 'ja' ? 'Japanese' : 'English';
    const targetLangText = targetLang === 'en' ? 'English' : 'Japanese';
    const direction = `${sourceLangText} to ${targetLangText}`;

    if (action === 'translateTextKanji') {
        return `You are a Japanese linguistic assistant.
1. Translate the text from ${sourceLangText} to ${targetLangText}.
2. Add a new line.
3. Identify the original Kanji used in the source text and provide their Hiragana readings in the format "Kanji = Hiragana", one per line.`;
    }
    return `You are a professional translator. Provide only the direct translation from ${direction}. No conversational filler.`;
}

// Handle streaming translation via ports
chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'translate-stream') return;

    port.onMessage.addListener(async (request) => {
        try {
            const apiKey = await getApiKey();
            if (!apiKey) {
                port.postMessage({ type: 'error', message: 'Missing API Key. Please open settings.' });
                return;
            }

            const systemPrompt = buildPrompt(request.action, request.sourceLang, request.targetLang);
            const payload = {
                contents: [{ parts: [{ text: request.text }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.3
                }
            };

            const url = `${API_BASE_URL}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                port.postMessage({ type: 'error', message: `API Error ${response.status}: ${errorData.error?.message || response.statusText}` });
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            port.postMessage({ type: 'chunk', text });
                        }
                    } catch (e) {
                        // Skip malformed JSON chunks
                    }
                }
            }

            port.postMessage({ type: 'done' });
        } catch (error) {
            console.error('Translation Error:', error);
            port.postMessage({ type: 'error', message: error.message || 'Network error' });
        }
    });
});

// Keep the simple message handler for saveApiKey
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveApiKey') {
        chrome.storage.sync.set({ 'geminiApiKey': request.apiKey }, () => {
            sendResponse({ status: 'success' });
        });
        return true;
    }
});
