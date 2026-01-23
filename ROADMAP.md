# Floating Translate - Extension Roadmap

*Last updated: January 18, 2026*

---

## Phase 1: Publish Free Version to Chrome Web Store

### Prerequisites (Code - Already Complete ✅)
- [x] Manifest V3 compliant
- [x] Proper icon sizes (16, 48, 128px)
- [x] Clean architecture with no external dependencies
- [x] Core functionality working

### Remaining Tasks

#### 1. Developer Account
- [ ] Register for Chrome Web Store Developer account
- [ ] Pay one-time $5 fee
- [ ] Link: https://chrome.google.com/webstore/devconsole

#### 2. Privacy Policy (Required)
Since the extension stores API keys and makes external API calls:

- [ ] Create simple privacy policy page
- [ ] Host on GitHub Pages (free)

**Sample content:**
```
Privacy Policy for Floating Translate

Data Storage:
- Your Gemini API key is stored locally in Chrome's sync storage
- API keys are never transmitted to any third party except Google's Gemini API

Data Transmission:
- Translation requests are sent directly to Google's Gemini API
- We do not operate any intermediary servers

Data Collection:
- We do not collect, store, or transmit any user data
- No analytics or tracking
```

#### 3. Store Listing Assets

**Required:**
- [ ] Screenshots (1280x800 or 640x400) - at least 1, up to 5
  - Show floating window on a webpage
  - Show translation in action
  - Show dark mode
  - Show kanji/kana feature

- [ ] Small promotional tile (440x280)
  - Extension icon + "Floating Translate" text
  - Simple, clean design

**Optional:**
- [ ] Large promotional tile (920x680)
- [ ] Marquee image (1400x560)

#### 4. Store Description
Expand on the manifest description for the store listing:

```
Lightweight Japanese-English translator with a floating, draggable interface.

Features:
• Floating window - stays on top of any webpage
• Japanese ↔ English translation powered by Gemini AI
• Kanji/Kana mode - shows readings for kanji characters
• Dark/Light mode toggle
• Rate limit protection with retry logic
• Uses your own Gemini API key (free tier available)

How to use:
1. Get a free Gemini API key from Google AI Studio
2. Click the extension icon on any webpage
3. Open Settings and paste your API key
4. Type or paste text and press Enter to translate

Perfect for language learners, travelers, and anyone who needs quick translations!
```

#### 5. Submission
- [ ] Upload extension ZIP file
- [ ] Fill out store listing
- [ ] Submit for review (typically 1-3 days)

---

## Phase 2: Pro Version - Region Selector Feature

### Overview
Fork/branch the free version to create "Floating Translate Pro" with advanced features for language learners.

### New Features

#### Region Selector Tool
- Draw a draggable/resizable box over any content on a webpage
- Press Enter to translate the selected region
- Works with both DOM text AND images (OCR fallback)

#### Smart Text Extraction
```
User draws selection → Press Enter →
1. Try DOM text extraction first
2. If empty/insufficient → use Gemini Vision for OCR
3. Translate extracted text
```

#### Side-by-Side Result Panel
- Shows original text
- Shows translation
- Shows kanji with furigana readings
- Smart positioning (right/left/above/below selection)
- Persistent until dismissed

#### Smart Positioning Logic
Priority order:
1. Right of selection (if space)
2. Left of selection (if space)
3. Below selection (if space)
4. Above selection (if space)
5. Center overlay (fallback)

### Technical Architecture

#### Shared with Free Version
- `background.js` - Gemini API handling
- Core translation logic
- Settings/API key storage
- Basic UI components

#### Pro-Only Files (New)
- `region-selector.js` - Selection box UI with resize handles
- `screenshot-capture.js` - Capture selected region as image
- `text-extractor.js` - DOM text extraction within bounds
- `license-validator.js` - License key verification
- `result-panel.js` - Side-by-side display with furigana

### UI/UX Flow

1. **Activation**
   - User clicks "📐 Select Region" button in floating window
   - Page dims with semi-transparent overlay
   - Cursor becomes crosshair

2. **Selection**
   - Click-drag to create selection box
   - Box has 8 resize handles + draggable top bar
   - Hint appears: "Press Enter to translate"

3. **Translation**
   - Enter key triggers translation
   - Loading state shown
   - Result panel appears with smart positioning

4. **Result Panel Content**
   ```
   ┌─────────────────────────────┐
   │ 📖 Original            [✕] │
   ├─────────────────────────────┤
   │ 日本語のテキスト            │
   ├─────────────────────────────┤
   │ 🌐 Translation              │
   ├─────────────────────────────┤
   │ Japanese text               │
   ├─────────────────────────────┤
   │ 📝 Kanji Readings           │
   ├─────────────────────────────┤
   │ 日本語 (にほんご)          │
   └─────────────────────────────┘
   ```

5. **Dismiss**
   - Click X button → selection box + result panel disappear
   - Esc key also dismisses

### OCR Strategy (Gemini Vision)
Use Gemini's multimodal capability for seamless OCR:

```javascript
// Single prompt handles OCR + translation + furigana
const prompt = `
Extract all Japanese text from this image and translate it to English.
Then provide the original kanji with furigana readings in format:
漢字 (かんじ)
`;
```

Benefits:
- Uses same API key as translation
- OCR + Translation in one call
- No additional service needed

### Development Phases

#### Week 1: Core Selection UI
- [ ] Region selection overlay
- [ ] Draggable/resizable box with handles
- [ ] Keyboard shortcuts (Enter, Esc)
- [ ] Basic DOM text extraction

#### Week 2: OCR Integration
- [ ] Screenshot capture of selected region
- [ ] Gemini Vision API integration
- [ ] Auto-fallback logic (DOM → OCR)
- [ ] Testing with various content types

#### Week 3: Result Display
- [ ] Smart positioning algorithm (4-direction)
- [ ] Result panel UI with sections
- [ ] Furigana rendering with ruby tags
- [ ] Copy/dismiss functionality

#### Week 4: Monetization
- [ ] License key system
- [ ] Payment integration (Gumroad or Stripe)
- [ ] Key validation in extension
- [ ] Chrome Web Store listing for Pro

---

## Phase 3: Monetization

### Pricing Strategy
- **One-time purchase:** $5-8 (user preference)
- No subscription

### Payment Platform Options

| Platform | Fees | Pros | Cons |
|----------|------|------|------|
| **Gumroad** | ~13% | Easiest, license keys built-in, handles VAT | Higher fees |
| **Stripe** | ~3% | Lower fees, flexible | Build license system yourself |
| **LemonSqueezy** | ~8% | Balance of ease + fees, handles VAT | Newer platform |
| **Paddle** | ~8-10% | Merchant of record, handles all taxes | Approval process |

### Current Preference
Going with **Gumroad** or **Stripe** based on familiarity.

### License Key Flow

1. **Purchase:**
   - User pays on Gumroad/Stripe
   - Receives license key via email

2. **Activation:**
   - User pastes key into Pro extension settings
   - Extension validates key via API

3. **Validation:**
   - Simple REST API (Firebase Function or similar)
   - Checks if key is valid and not revoked
   - Stores validation status locally

4. **Unlock:**
   - Valid key → Pro features enabled
   - Invalid/missing key → Show "Enter License Key" prompt

---

## Files to Remove (Cleanup)

These files were added by AI Studio and aren't needed for the extension:

- [x] ~~`package.json`~~ - Vite/TypeScript dependencies (not used)
- [x] ~~`tsconfig.json`~~ - TypeScript config (code is plain JS)
- [x] ~~`metadata.json`~~ - AI Studio metadata
- [x] ~~`icon.png`~~ - Replaced by properly-sized icons

---

## Current Extension Structure

```
chrome-ext-floating-translate/
├── manifest.json        # Extension manifest (v3)
├── background.js        # Service worker, API calls
├── content_script.js    # Main UI, floating window
├── script.js            # Popup launcher
├── index.html           # Popup HTML
├── icon16.png           # Toolbar icon
├── icon48.png           # Extensions page icon
├── icon128.png          # Store/install icon
├── icon.svg             # Source SVG
├── .env.local           # Local config
├── .gitignore           # Git ignore rules
└── ROADMAP.md           # This file
```

---

## Quick Reference Links

- **Chrome Web Store Developer Console:** https://chrome.google.com/webstore/devconsole
- **Google AI Studio (Gemini API):** https://aistudio.google.com/
- **Gumroad:** https://gumroad.com
- **Stripe:** https://stripe.com
- **GitHub Pages (for privacy policy):** https://pages.github.com

---

*Ready to continue? Pick up where you left off!*
