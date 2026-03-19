# Chrome Web Store Publishing Checklist

## 1) Preflight

- [ ] Verify repository links point to `https://github.com/kerapps/LinkedOut`
- [ ] Verify icons are final (16/48/128)
- [ ] Verify extension version in `manifest.json` is bumped
- [ ] Remove debug logs or guard behind debug flag

## 2) Open Source Setup

- [ ] Create GitHub repo
- [ ] Push source code
- [ ] Add repository description/topics
- [ ] Ensure `README.md`, `LICENSE`, and `PRIVACY_POLICY.md` are present

## 3) Store Assets

- [ ] 1280x800 screenshots
- [ ] 440x280 promo tile (optional but recommended)
- [ ] Final short description and detailed description

## 4) CWS Data Disclosure

- [ ] Declare user content processing (LinkedIn post text)
- [ ] Declare data is transmitted off-device to selected LLM provider
- [ ] Declare storage usage (`chrome.storage.sync`, `chrome.storage.local`)
- [ ] Provide privacy policy URL

## 5) Submit

- [ ] Zip extension root contents (not parent folder)
- [ ] Upload in Chrome Web Store Developer Dashboard
- [ ] Fill listing metadata and compliance sections
- [ ] Submit for review

## 6) Post-Approval

- [ ] Create changelog entry for release
- [ ] Tag GitHub release
- [ ] Monitor issues and reviews
