# Privacy Policy for LinkedOut

_Last updated: 2026-03-19_

This Privacy Policy explains how LinkedOut ("the Extension") handles data.
LinkedOut is a browser extension that translates LinkedIn post text using a language model provider selected by the user.

## 1. Data We Process

LinkedOut may process the following categories of data:

- **User-provided settings** (provider choice, tone, feature toggles)
- **User-provided API key** (for your selected AI provider)
- **LinkedIn post text** (only when you request translation or auto-translation is enabled)
- **Generated outputs** (translated text and optional "corporate rewrite" output)
- **Local usage metrics** (for example: translated posts count, token counters)
- **Local cache entries** (to avoid repeated API requests for the same content)

## 2. Where Data Is Processed

LinkedOut runs locally in your browser.  
LinkedOut does not operate its own backend server.

When translation/rewrite is requested, relevant text is sent directly from your browser to the provider you selected:

- OpenAI, or
- Anthropic

Their processing is governed by their own terms and privacy policies.

## 3. Data Sharing

LinkedOut does not sell personal data.  
LinkedOut does not share data with third parties except the AI provider you explicitly configured for feature operation.

## 4. Storage and Retention

LinkedOut uses browser extension storage:

- `chrome.storage.sync` for settings and API key
- `chrome.storage.local` for cache and usage stats

Data remains stored until you remove it, clear browser extension storage, or uninstall the extension.

## 5. Security

- Requests to supported AI providers are sent over HTTPS.
- API keys are stored in browser extension storage and not intentionally exposed in page context.
- You are responsible for securing and rotating your API keys as needed.

## 6. Your Choices and Controls

You can:

- Disable auto-translation
- Enable/disable promoted post removal
- Enable/disable hiding original text
- Remove or change your API key at any time
- Clear extension data by clearing extension storage or uninstalling the extension

## 7. Children's Privacy

LinkedOut is not directed to children under 13, and we do not knowingly collect personal information from children.

## 8. Changes to This Policy

This policy may be updated from time to time. The "Last updated" date above indicates the latest revision.

## 9. Contact

For privacy questions, open an issue in the repository:

- `https://github.com/kerapps/LinkedOut/issues`
