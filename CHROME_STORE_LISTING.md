# Chrome Web Store Listing — BuzzKill

Ready-to-paste content for each field in the Chrome Web Store Developer Dashboard.

---

## Extension Name

```
BuzzKill — LinkedIn Corporate Speak Translator
```

## Short Description (132 characters max)

```
Translate LinkedIn corporate speak into plain language using your own AI API key. Hide promoted posts. Write corpo-style posts.
```

_(126 characters)_

## Detailed Description

```
BuzzKill cuts through the LinkedIn jargon so you can read what people actually mean.

HOW IT WORKS
You provide your own API key (OpenAI or Anthropic). When you request a translation — or enable auto-translate — BuzzKill sends the post text to the AI provider you selected and displays the plain-language version right in your feed.

No custom backend. No data collection. No tracking. Your API key, your calls.

COST: ~$0.13 per 1,000 posts with gpt-4o-mini. Translations are cached, so revisiting posts costs nothing.

FEATURES
• Translate posts into plain language — choose blunt, sarcastic, or neutral tone
• Auto-translate mode — every post translated as you scroll
• Hide original text — show only the translated version
• Hide promoted / sponsored posts (enabled by default)
• Keep @mentions and links — optionally preserve clickable person tags and URLs in translations
• In-page HUD with quick-access settings and stats
• "Create a post" mode — convert plain text into LinkedIn corporate speak
• Translation cache — avoids duplicate API calls to save tokens
• Token usage tracker with estimated cost

DATA & PRIVACY
• Post text is sent only to the AI provider you configured (OpenAI or Anthropic), using your own API key, solely for translation.
• All requests go directly from your browser over HTTPS — no intermediary server.
• Settings, cache, and stats are stored locally in your browser.
• No personal data is collected, sold, or shared for advertising.
• Full privacy policy: https://github.com/kerapps/BuzzKill/blob/main/PRIVACY_POLICY.md

OPEN SOURCE
BuzzKill is free and open source under the MIT license.
Source code: https://github.com/kerapps/BuzzKill
```

## Category

```
Productivity
```

## Language

```
English
```

## Support URL

```
https://github.com/kerapps/BuzzKill/issues
```

## Homepage URL

```
https://github.com/kerapps/BuzzKill
```

## Privacy Policy URL

```
https://github.com/kerapps/BuzzKill/blob/main/PRIVACY_POLICY.md
```

---

## CWS Privacy Practices Tab — Field-by-Field Answers

Fill these in the **Privacy practices** tab of the Developer Dashboard.

### Single purpose description

```
Translates LinkedIn post text into plain language using the user's own AI API key, with optional @mention and link preservation, and can rewrite plain text into LinkedIn corporate style.
```

### Permission justification: host_permissions (https://www.linkedin.com/*)

```
Required to inject content scripts that read LinkedIn feed post text for translation, inject the translation UI, and optionally hide promoted posts.
```

### Permission justification: storage

```
Used to persist user settings (provider, tone, toggles), the user's API key, translation cache, and usage statistics locally in the browser.
```

### Does your extension collect or use data?

**Yes**

### Data type disclosures

| Data type | Collected? | Usage reason |
|---|---|---|
| Website content | Yes | LinkedIn post text is read to provide translation (the extension's primary feature). |
| Personally identifiable information | No | — |
| Health information | No | — |
| Financial and payment information | No | — |
| Authentication information | Yes | The user's own AI provider API key is stored to authenticate translation requests. |
| Personal communications | No | — |
| Location | No | — |
| Web browsing activity | No | No browsing history is collected; only the text of individual posts is read for translation. |
| User activity | No | — |

### Are you using remote code?

**No** — All JavaScript is shipped within the extension package. No scripts are fetched or executed from external sources.

### Certify data use complies with Limited Use policy

**Yes** — Data is used solely to provide the extension's stated features. It is not sold, used for advertising, or transferred to third parties except the AI provider the user selected for translation.

---

## Required Store Assets

| Asset | Dimensions | Format | Required? |
|---|---|---|---|
| Extension icon | 128 × 128 | PNG | Yes (already in `icons/icon128.png`) |
| Screenshot(s) | 1280 × 800 **or** 640 × 400 | PNG / JPEG | Yes — at least 1, up to 5 |
| Small promo tile | 440 × 280 | PNG | Optional but recommended |
| Marquee promo tile | 1400 × 560 | PNG | Optional |

See `store-assets/README.md` for screenshot preparation instructions.
