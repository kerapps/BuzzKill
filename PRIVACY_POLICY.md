# Privacy Policy for BuzzKill

_Last updated: 2026-03-19_

This Privacy Policy explains how BuzzKill ("the Extension") handles data.
BuzzKill is a browser extension that translates LinkedIn post text using a language model provider selected by the user.

## 1. Data We Collect and Process

| Data type | Collected? | Sent off-device? | Purpose |
|---|---|---|---|
| LinkedIn post text | Yes, when translation is triggered | Yes, to your chosen AI provider (OpenAI or Anthropic) | Translation / rewrite |
| User-provided API key | Yes | Yes, as an authentication header to the provider you selected | Authenticate API requests |
| User settings (provider, tone, toggles) | Yes | No | Stored locally to configure the extension |
| Generated outputs (translations, rewrites) | Yes | No | Displayed to you and cached locally |
| Usage metrics (post count, token count, estimated cost) | Yes | No | Displayed in the extension UI |
| Translation cache (text hash + result) | Yes | No | Avoid duplicate API requests |

BuzzKill does **not** collect or transmit:

- Browsing history
- Personal identifiers (name, email, IP)
- Credentials other than the API key you provide
- Analytics or telemetry to any server operated by BuzzKill

## 2. How Data Is Transmitted

BuzzKill does not operate its own backend server. All processing happens locally in your browser.

When you request a translation or enable auto-translation, the text of the LinkedIn post is sent **directly from your browser** to the API endpoint of the provider you selected:

- **OpenAI** — `https://api.openai.com` — [Privacy Policy](https://openai.com/policies/privacy-policy)
- **Anthropic** — `https://api.anthropic.com` — [Privacy Policy](https://www.anthropic.com/privacy)

All requests are transmitted over **HTTPS**. No intermediary server is involved.

## 3. Data Sharing

- BuzzKill does **not** sell, rent, or trade personal data.
- BuzzKill does **not** share data with any third party except the AI provider you explicitly configured.
- BuzzKill does **not** use data for advertising, analytics, or profiling.

## 4. Storage and Retention

BuzzKill uses Chrome extension storage APIs:

- `chrome.storage.sync` — settings and API key (synced across your Chrome profile)
- `chrome.storage.local` — translation cache and usage statistics

Data remains stored until you:

- Change or remove it in the extension settings
- Clear extension storage via Chrome settings
- Uninstall the extension

## 5. Security

- All network requests to AI providers are sent over HTTPS.
- Your API key is stored in `chrome.storage.sync` and is never exposed in page context or logged.
- You are responsible for securing and rotating your own API keys.

## 6. Your Choices and Controls

You can at any time:

- Disable auto-translation (posts are only translated on demand)
- Enable or disable promoted post removal
- Enable or disable hiding original text
- Remove or change your API key
- Clear all extension data by clearing storage or uninstalling

## 7. Chrome Web Store User Data Policy Compliance

The use of information received from Chrome APIs adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/), including the Limited Use requirements. Specifically:

- Data use is limited to providing the extension's stated functionality (translation and content rewriting).
- User data is not transferred to third parties except as required for core functionality (sending post text to the AI provider you selected).
- User data is not used for advertising, creditworthiness determination, or sale to data brokers.
- No human reads user data except as aggregated, anonymized information for debugging (e.g., error logs you choose to share in a bug report).

## 8. Web Browsing Activity

BuzzKill reads the text content of LinkedIn feed posts solely to provide translation. It does **not** collect, store, or transmit browsing history, URLs visited, or any page content outside of the specific post text selected for translation.

This collection of website content is required for the extension's user-facing feature (translation) and is described prominently in the Chrome Web Store listing and this privacy policy.

## 9. Children's Privacy

BuzzKill is not directed to children under 13, and we do not knowingly collect personal information from children.

## 10. Changes to This Policy

This policy may be updated from time to time. The "Last updated" date above indicates the latest revision.

## 11. Contact

For privacy questions, open an issue in the repository:

- <https://github.com/kerapps/BuzzKill/issues>
