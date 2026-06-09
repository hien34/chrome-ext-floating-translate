# Floating Translate

A lightweight Chrome extension that puts a floating, draggable window on any webpage for quick Japanese and English translation. Translation runs through Google Gemini using your own API key, with a kanji/kana reading mode, dark/light toggle, and rate-limit retry logic. The code is plain HTML, CSS, and JavaScript with no build step or external dependencies.

## Version history

- **2026-05-31**: Fixed kanji so it no longer changes when toggling the kanji/kana button.
- **2026-04-25**: Moved the close button to the bottom right so it stops covering translated text.
- **2026-03-29**: Upgraded the translation model to Gemini 2.5 Flash.
- **2026-01-23**: Iterated through Gemini model and tier options (2.0, 2.0 Lite, 1.5, 3.0 Flash free tier), dropped the unsupported "thinking" parameter for faster responses, and refreshed the icons.
- **2026-01-03**: Initial upload from Gemini AI Studio, then removed unnecessary scaffolding files.

See [ROADMAP.md](ROADMAP.md) for the Chrome Web Store publish plan and the planned Pro region-selector version.
