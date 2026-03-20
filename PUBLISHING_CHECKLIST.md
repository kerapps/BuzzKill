# Chrome Web Store Publishing Checklist

Step-by-step guide to publish BuzzKill. Check off each item as you go.

---

## 1. Developer Account

- [ ] Register at <https://chrome.google.com/webstore/devconsole>
- [ ] Pay the one-time $5 registration fee
- [ ] Enable 2-Step Verification on your Google account (required)
- [ ] Complete identity verification if publishing for the first time

## 2. Repository & Source

- [ ] Repo is live at <https://github.com/kerapps/BuzzKill>
- [ ] `README.md`, `LICENSE`, and `PRIVACY_POLICY.md` are present and up to date
- [ ] All links in docs point to `https://github.com/kerapps/BuzzKill`
- [ ] No API keys, secrets, or `.env` files in the repo

## 3. Extension Files

- [ ] `manifest.json` version is correct (currently `1.1.0`)
- [ ] Icons are final: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`
- [ ] `DEBUG` flag in `content.js` is set to `false`
- [ ] Extension loads cleanly in `chrome://extensions/` with no errors
- [ ] Test: popup opens and settings save correctly
- [ ] Test: feed translation works (auto and manual)
- [ ] Test: "Create post" works in both popup and HUD
- [ ] Test: "Remove promoted posts" hides sponsored content
- [ ] Test: page reloads when settings change

## 4. Store Assets (you must create these)

Place files in `store-assets/` (excluded from the extension zip).

- [ ] **Screenshot 1** — Feed with translated posts (1280 × 800 or 640 × 400, PNG/JPEG)
- [ ] **Screenshot 2** — Popup settings panel (1280 × 800 or 640 × 400)
- [ ] **Screenshot 3** — HUD overlay open on feed (1280 × 800 or 640 × 400)
- [ ] _(Optional)_ **Small promo tile** — 440 × 280 PNG
- [ ] _(Optional)_ **Marquee promo tile** — 1400 × 560 PNG

**Tips for screenshots:**
- Use a clean Chrome profile (no other extensions visible)
- Show the extension in action with realistic content
- Avoid showing personal/identifiable information
- Annotate or add captions if helpful

## 5. Build the ZIP

Run the included packaging script:

```bash
./package.sh
```

This creates `buzzkill.zip` containing only the extension files. Verify:

```bash
unzip -l buzzkill.zip
```

Should contain: `manifest.json`, `background.js`, `translator.js`, `content.js`, `content.css`, `popup.html`, `popup.js`, `popup.css`, `icons/`.

Should **not** contain: `README.md`, `LICENSE`, `PRIVACY_POLICY.md`, `store-assets/`, `.git/`, etc.

## 6. Upload & Fill Dashboard Fields

Go to <https://chrome.google.com/webstore/devconsole> → **New Item** → Upload `buzzkill.zip`.

### Store listing tab

Copy-paste each field from `CHROME_STORE_LISTING.md`:

- [ ] Extension name
- [ ] Short description (max 132 chars)
- [ ] Detailed description
- [ ] Category → **Productivity**
- [ ] Language → **English**
- [ ] Upload screenshots (at least 1)
- [ ] Upload promo tile(s) if prepared
- [ ] Store icon (128 × 128) — auto-populated from manifest

### Privacy practices tab

Copy-paste from the "CWS Privacy Practices Tab" section of `CHROME_STORE_LISTING.md`:

- [ ] Single purpose description
- [ ] Permission justification: `host_permissions`
- [ ] Permission justification: `storage`
- [ ] Data type disclosures (website content: yes, auth info: yes, everything else: no)
- [ ] Remote code: **No**
- [ ] Certify Limited Use compliance: **Yes**
- [ ] Privacy policy URL: `https://github.com/kerapps/BuzzKill/blob/main/PRIVACY_POLICY.md`

### Distribution tab

- [ ] Visibility: **Public**
- [ ] Distribution: **All regions** (or select specific countries)

## 7. Submit for Review

- [ ] Click **Submit for review**
- [ ] Review typically takes 1–3 business days (can be longer for first submission)
- [ ] Monitor status at <https://chrome.google.com/webstore/devconsole>

## 8. Post-Approval

- [ ] Verify listing is live and installable
- [ ] Create a GitHub release and tag (e.g., `v1.1.0`)
- [ ] Update `README.md` with Chrome Web Store install link
- [ ] Announce / share the link
- [ ] Monitor user reviews and GitHub issues
