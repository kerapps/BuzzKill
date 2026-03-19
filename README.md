# LinkedOut — LinkedIn BS Translator

LinkedOut is a Chrome extension that translates LinkedIn corporate speak into plain language and can also rewrite plain text into LinkedIn-style corporate tone.

Inspired by [Kagi Translate's LinkedIn Speak](https://translate.kagi.com/?from=en&to=LinkedIn+speak), but in reverse for feed clarity.

## Features

- Translate post text into plain language (blunt/sarcastic/neutral)
- Auto-translate feed mode
- Hide original post text option
- Hide promoted posts option (enabled by default)
- In-page LinkedOut HUD with quick settings
- "Create a post" mode (plain text -> corporate LinkedIn style)
- Token usage tracking
- Translation cache to reduce repeated API spend

## Install (Developer Mode)

1. Clone or download this project
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select this folder

## Configuration

| Setting | Description |
|---|---|
| Provider | OpenAI or Anthropic |
| API Key | Your provider API key |
| Tone | Blunt / Sarcastic / Neutral |
| Auto-translate | Translate feed posts automatically |
| Hide original | Show only translated text |
| Hide promoted | Remove promoted/sponsored posts |

## Open Source

- Repository: `https://github.com/YOUR_GITHUB_USERNAME/linkedout`
- Issues: `https://github.com/YOUR_GITHUB_USERNAME/linkedout/issues`

Replace `YOUR_GITHUB_USERNAME` before publishing.

## Chrome Web Store Prep

- Listing copy: `CHROME_STORE_LISTING.md`
- Privacy policy: `PRIVACY_POLICY.md`
- Publish checklist: `PUBLISHING_CHECKLIST.md`

## Privacy

See `PRIVACY_POLICY.md`.

## License

MIT (`LICENSE` file)
