# Store Assets

This folder holds images required for the Chrome Web Store listing.
These files are **not** included in the extension zip — they are only uploaded to the CWS dashboard.

## Required

### Screenshots (at least 1, up to 5)

| File | Dimensions | Format | Description |
|---|---|---|---|
| `screenshot-1-feed.png` | 1280 × 800 | PNG | Feed with translated posts visible |
| `screenshot-2-popup.png` | 1280 × 800 | PNG | Popup with settings and stats |
| `screenshot-3-hud.png` | 1280 × 800 | PNG | In-page HUD overlay open |

**How to capture:**

1. Open Chrome with a clean profile (or hide other extension icons)
2. Go to `https://www.linkedin.com/feed/`
3. Make sure BuzzKill is active and posts are translated
4. Take a full-window screenshot at 1280 × 800 resolution
   - macOS: `Cmd + Shift + 4`, then `Space` to capture the window
   - Or use Chrome DevTools → Device toolbar → set to 1280 × 800
5. Crop to exactly 1280 × 800 if needed
6. Save as PNG

**Tips:**
- Blur or redact names/photos if they belong to real people
- Show a variety of translated posts in different tones
- Keep the browser chrome minimal and clean
- Ensure text is readable — avoid tiny screenshots

## Optional (recommended)

### Small Promotional Tile

| File | Dimensions | Format |
|---|---|---|
| `promo-small.png` | 440 × 280 | PNG |

Design suggestions:
- Use the BuzzKill icon/branding prominently
- Include a short tagline like "Cut through the corporate speak"
- Keep it simple — this appears as a small card

### Marquee Promotional Tile

| File | Dimensions | Format |
|---|---|---|
| `promo-marquee.png` | 1400 × 560 | PNG |

Only needed if your extension gets featured. You can add it later.
