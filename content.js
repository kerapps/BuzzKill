(() => {
  const DEBUG = false;
  const SOURCE_URL = "https://github.com/YOUR_GITHUB_USERNAME/linkedout";
  const PRIVACY_URL =
    "https://github.com/YOUR_GITHUB_USERNAME/linkedout/blob/main/PRIVACY_POLICY.md";
  const PROCESSED_ATTR = "data-linkedout";
  const RESCAN_INTERVAL_MS = 2500;
  const LOG = (...args) => {
    if (DEBUG) console.log("[LinkedOut]", ...args);
  };
  const MIN_TEXT_LEN = 80;
  const MAX_TEXT_LEN = 5000;
  const MIN_FEED_CARD_WIDTH = 420;

  let autoTranslate = false;
  let hideOriginal = false;
  let removePromoted = true;
  let scanCount = 0;
  let hudMounted = false;

  function getMainFeed() {
    return document.querySelector("main");
  }

  function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function isInjectedElement(el) {
    return !!el.closest(
      ".linkedout-wrapper, .linkedout-card, .linkedout-btn, .linkedout-banner, .linkedout-loading"
    );
  }

  function findCardContainer(startEl) {
    const urnContainer = startEl.closest("[data-urn]");
    if (urnContainer) return urnContainer;

    const main = getMainFeed();
    let node = startEl;
    for (let i = 0; i < 12 && node && node !== main; i++) {
      const rect = node.getBoundingClientRect();
      const widthOk = rect.width >= 420 && rect.width <= 980;
      const heightOk = rect.height >= 120 && rect.height <= 2600;
      if (widthOk && heightOk) {
        return node;
      }
      node = node.parentElement;
    }
    return startEl.parentElement || startEl;
  }

  function extractPostId(container) {
    const urn = container.getAttribute("data-urn");
    if (urn && urn.trim()) return urn.trim();

    const updateLink = container.querySelector("a[href*='/feed/update/']");
    if (updateLink) {
      const href = updateLink.getAttribute("href") || "";
      const urnMatch = href.match(/urn:li:activity:\d+/);
      if (urnMatch) return urnMatch[0];
      const updateMatch = href.match(/\/feed\/update\/([^/?#]+)/);
      if (updateMatch) return `feedUpdate:${updateMatch[1]}`;
    }

    const postLink = container.querySelector("a[href*='/posts/']");
    if (postLink) {
      const href = postLink.getAttribute("href") || "";
      const postMatch = href.match(/\/posts\/([^/?#]+)/);
      if (postMatch) return `post:${postMatch[1]}`;
    }

    return null;
  }

  function isLikelyFeedColumnCard(container) {
    if (!(container instanceof HTMLElement)) return false;
    const rect = container.getBoundingClientRect();
    if (rect.width < MIN_FEED_CARD_WIDTH) return false;
    if (rect.width > 980) return false;
    if (rect.height < 120) return false;
    if (rect.height > 3200) return false;

    const centerX = rect.left + rect.width / 2;
    const minCenter = window.innerWidth * 0.22;
    const maxCenter = window.innerWidth * 0.72;
    if (centerX < minCenter || centerX > maxCenter) return false;

    return true;
  }

  function isPromotedPost(container) {
    const preview = normalizeText(container.innerText || "")
      .slice(0, 420)
      .toLowerCase();
    return /\bpromoted\b|\bsponsored\b/.test(preview);
  }

  function hidePromotedPosts() {
    if (!removePromoted) return;
    const main = getMainFeed();
    if (!main) return;

    const candidates = main.querySelectorAll("div, article, section");
    for (const el of candidates) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.offsetParent === null) continue;

      const text = normalizeText(el.innerText || "").slice(0, 420).toLowerCase();
      if (!/\bpromoted\b|\bsponsored\b/.test(text)) continue;

      const card = findCardContainer(el);
      if (!isLikelyFeedColumnCard(card)) continue;
      card.style.display = "none";
      card.setAttribute("data-linkedout-promoted-removed", "1");
    }
  }

  function isLikelyCommentOrMetaText(el, text) {
    const lower = text.toLowerCase();

    if (el.closest("aside, nav, header, footer")) return true;
    if (el.closest("[contenteditable='true']")) return true;
    if (el.closest("form")) return true;

    // Typical comment/reply language.
    if (
      /\b(comment|comments|reply|replies|respond|response|see all comments)\b/.test(
        lower
      )
    ) {
      return true;
    }

    // Avoid short profile/title style snippets even if repeated.
    if (text.length < 140 && el.querySelectorAll("a").length >= 2) {
      return true;
    }

    return false;
  }

  function collectCandidateTextElements() {
    const main = getMainFeed();
    if (!main) return [];

    const pool = main.querySelectorAll("div, span, p");
    const byContainer = new Map();

    for (const el of pool) {
      if (!(el instanceof HTMLElement)) continue;
      if (isInjectedElement(el)) continue;
      if (el.offsetParent === null) continue;
      if (el.childElementCount > 30) continue;
      if (el.querySelector("input, textarea")) continue;

      const raw = el.innerText || "";
      const text = normalizeText(raw);
      if (text.length < MIN_TEXT_LEN || text.length > MAX_TEXT_LEN) continue;
      if (isLikelyCommentOrMetaText(el, text)) continue;

      const buttonsNearby = el.querySelectorAll("button").length;
      if (buttonsNearby > 3) continue;

      const container = findCardContainer(el);
      if (!isLikelyFeedColumnCard(container)) continue;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (containerRect.height <= 0) continue;

      const relativeTop = (elRect.top - containerRect.top) / containerRect.height;
      const relativeBottom =
        (containerRect.bottom - elRect.bottom) / containerRect.height;

      // Main post text usually sits in the upper-middle zone of a post card.
      // This drops title/header text (too high) and comments/actions (too low).
      if (relativeTop < 0.08 || relativeTop > 0.72) continue;
      if (relativeBottom < 0.06) continue;

      const score =
        text.length -
        el.childElementCount * 3 -
        Math.abs(relativeTop - 0.28) * 180;
      const existing = byContainer.get(container);

      if (!existing || score > existing.score) {
        byContainer.set(container, { container, textEl: el, text, score });
      }
    }

    return Array.from(byContainer.values());
  }

  // --- UI Components ---

  function createTranslateButton() {
    const btn = document.createElement("button");
    btn.className = "linkedout-btn";
    btn.textContent = "Translate to Human";
    return btn;
  }

  function createTranslationCard(translation) {
    const card = document.createElement("div");
    card.className = "linkedout-card";

    const header = document.createElement("div");
    header.className = "linkedout-card-header";
    header.innerHTML = `<span class="linkedout-label">LinkedOut</span>`;

    const toggle = document.createElement("button");
    toggle.className = "linkedout-toggle";
    toggle.textContent = "Show original";
    header.appendChild(toggle);

    const body = document.createElement("div");
    body.className = "linkedout-card-body";
    body.textContent = translation;

    card.appendChild(header);
    card.appendChild(body);
    return { card, toggle };
  }

  function showLoading(container) {
    const spinner = document.createElement("div");
    spinner.className = "linkedout-loading";
    spinner.innerHTML =
      '<div class="linkedout-spinner"></div><span>Translating BS...</span>';
    container.appendChild(spinner);
    return spinner;
  }

  async function readStats() {
    const result = await chrome.storage.local.get("linkedout_stats");
    return result.linkedout_stats || { translated: 0, total_tokens: 0 };
  }

  async function refreshHudValues() {
    const hud = document.querySelector(".linkedout-hud");
    if (!hud) return;

    const settings = await LinkedOutTranslator.getSettings();
    const stats = await readStats();

    const provider = hud.querySelector("#loHudProvider");
    const tone = hud.querySelector("#loHudTone");
    const auto = hud.querySelector("#loHudAuto");
    const hide = hud.querySelector("#loHudHide");
    const promoted = hud.querySelector("#loHudPromoted");
    const key = hud.querySelector("#loHudApiKey");
    const tokens = hud.querySelector("#loHudTokens");

    if (provider) provider.value = settings.provider;
    if (tone) tone.value = settings.tone;
    if (auto) auto.checked = !!settings.autoTranslate;
    if (hide) hide.checked = !!settings.hideOriginal;
    if (promoted) promoted.checked = settings.removePromoted !== false;
    if (key) key.value = settings.apiKey || "";
    if (tokens) tokens.textContent = String(stats.total_tokens || 0);
  }

  function mountHud() {
    if (hudMounted || document.querySelector(".linkedout-hud")) return;
    hudMounted = true;

    const hud = document.createElement("div");
    hud.className = "linkedout-hud";
    hud.innerHTML = `
      <button class="linkedout-hud-fab" title="LinkedOut">out</button>
      <div class="linkedout-hud-panel" aria-hidden="true">
        <div class="linkedout-hud-header">
          <strong>LinkedOut</strong>
          <span class="linkedout-hud-sub">enabled</span>
        </div>

        <div class="linkedout-hud-group">
          <label>Provider</label>
          <select id="loHudProvider">
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        <div class="linkedout-hud-group">
          <label>Tone</label>
          <select id="loHudTone">
            <option value="blunt">Blunt</option>
            <option value="sarcastic">Sarcastic</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div class="linkedout-hud-group">
          <label>API Key</label>
          <input id="loHudApiKey" type="password" placeholder="sk-..." />
        </div>

        <label class="linkedout-hud-check">
          <input id="loHudAuto" type="checkbox" />
          <span>Auto-translate feed</span>
        </label>
        <label class="linkedout-hud-check">
          <input id="loHudHide" type="checkbox" />
          <span>Hide original content</span>
        </label>
        <label class="linkedout-hud-check">
          <input id="loHudPromoted" type="checkbox" />
          <span>Remove promoted posts</span>
        </label>

        <div class="linkedout-hud-stats">
          <span>Tokens used:</span>
          <strong id="loHudTokens">0</strong>
        </div>

        <button class="linkedout-hud-save" id="loHudSave">Save settings</button>
        <div class="linkedout-hud-save-status" id="loHudSaveStatus"></div>
        <div class="linkedout-hud-links">
          <a id="loHudSource" href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">Source</a>
          <a id="loHudPrivacy" href="${PRIVACY_URL}" target="_blank" rel="noopener noreferrer">Privacy</a>
        </div>

        <hr />

        <div class="linkedout-hud-group">
          <label>Create a post (Corpo mode)</label>
          <textarea id="loHudComposeInput" placeholder="Write your plain message..."></textarea>
        </div>
        <button class="linkedout-hud-create" id="loHudCreate">LinkedIn-ify</button>
        <div class="linkedout-hud-group">
          <textarea id="loHudComposeOutput" readonly placeholder="Corporate version appears here..."></textarea>
        </div>
        <button class="linkedout-hud-copy" id="loHudCopy">Copy output</button>
      </div>
    `;

    document.body.appendChild(hud);

    const fab = hud.querySelector(".linkedout-hud-fab");
    const panel = hud.querySelector(".linkedout-hud-panel");
    const saveBtn = hud.querySelector("#loHudSave");
    const saveStatus = hud.querySelector("#loHudSaveStatus");
    const createBtn = hud.querySelector("#loHudCreate");
    const copyBtn = hud.querySelector("#loHudCopy");
    const outputEl = hud.querySelector("#loHudComposeOutput");
    const inputEl = hud.querySelector("#loHudComposeInput");

    fab.addEventListener("click", async () => {
      const open = panel.classList.toggle("is-open");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        await refreshHudValues();
      }
    });

    saveBtn.addEventListener("click", async () => {
      const nextSettings = {
        provider: hud.querySelector("#loHudProvider").value,
        apiKey: hud.querySelector("#loHudApiKey").value.trim(),
        tone: hud.querySelector("#loHudTone").value,
        autoTranslate: hud.querySelector("#loHudAuto").checked,
        hideOriginal: hud.querySelector("#loHudHide").checked,
        removePromoted: hud.querySelector("#loHudPromoted").checked,
      };

      await chrome.storage.sync.set({ linkedout_settings: nextSettings });
      saveStatus.textContent = "Saved";
      setTimeout(() => {
        saveStatus.textContent = "";
      }, 1500);
    });

    createBtn.addEventListener("click", async () => {
      const plainText = inputEl.value.trim();
      if (!plainText) return;

      createBtn.disabled = true;
      createBtn.textContent = "Generating...";
      try {
        const corp = await LinkedOutTranslator.linkedinize(plainText);
        outputEl.value = corp;
        await refreshHudValues();
      } catch (err) {
        outputEl.value = err.message || "Failed to generate post.";
      } finally {
        createBtn.disabled = false;
        createBtn.textContent = "LinkedIn-ify";
      }
    });

    copyBtn.addEventListener("click", async () => {
      const text = outputEl.value.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy output";
        }, 1200);
      } catch {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => {
          copyBtn.textContent = "Copy output";
        }, 1200);
      }
    });
  }

  // --- Core logic ---

  async function translatePost(postEl, textEl, text) {
    const wrapper =
      postEl.querySelector(".linkedout-wrapper") ||
      createWrapper(postEl, textEl);

    if (wrapper.querySelector(".linkedout-card")) return;

    const existingBtn = wrapper.querySelector(".linkedout-btn");
    if (existingBtn) existingBtn.remove();

    const loading = showLoading(wrapper);

    try {
      const postId = extractPostId(postEl);
      const translation = await LinkedOutTranslator.translate(text, { postId });
      loading.remove();

      const { card, toggle } = createTranslationCard(translation);
      wrapper.appendChild(card);

      if (hideOriginal) {
        textEl.style.display = "none";
      }

      let showingOriginal = false;
      toggle.addEventListener("click", () => {
        showingOriginal = !showingOriginal;
        if (showingOriginal) {
          textEl.style.display = "";
          card.querySelector(".linkedout-card-body").style.display = "none";
          toggle.textContent = "Show translation";
        } else {
          textEl.style.display = hideOriginal ? "none" : "";
          card.querySelector(".linkedout-card-body").style.display = "";
          toggle.textContent = "Show original";
        }
      });
    } catch (err) {
      loading.remove();
      const errorEl = document.createElement("div");
      errorEl.className = "linkedout-error";
      errorEl.textContent = err.message;
      wrapper.appendChild(errorEl);
      setTimeout(() => errorEl.remove(), 5000);
    }
  }

  function createWrapper(postEl, textEl) {
    const wrapper = document.createElement("div");
    wrapper.className = "linkedout-wrapper";
    textEl.parentNode.insertBefore(wrapper, textEl.nextSibling);
    return wrapper;
  }

  function processPost(postEl) {
    if (postEl.getAttribute(PROCESSED_ATTR)) return;
    postEl.setAttribute(PROCESSED_ATTR, "true");
  }

  function scanPosts() {
    scanCount += 1;
    hidePromotedPosts();
    const candidates = collectCandidateTextElements();
    const filteredCandidates = candidates.filter(
      (candidate) =>
        !candidates.some(
          (other) =>
            other !== candidate && other.container.contains(candidate.container)
        )
    );

    if (scanCount <= 5 || scanCount % 10 === 0) {
      LOG(
        `scan #${scanCount}: ${candidates.length} candidates, ${filteredCandidates.length} top-level`
      );
    }

    filteredCandidates.forEach(({ container, textEl, text }) => {
      if (removePromoted && isPromotedPost(container)) {
        container.style.display = "none";
        container.setAttribute("data-linkedout-promoted-removed", "1");
        return;
      }

      processPost(container);
      if (container.querySelector(".linkedout-wrapper")) return;

      if (autoTranslate) {
        translatePost(container, textEl, text);
        return;
      }

      const wrapper = createWrapper(container, textEl);
      const btn = createTranslateButton();
      btn.addEventListener("click", () => {
        btn.remove();
        translatePost(container, textEl, text);
      });
      wrapper.appendChild(btn);
    });
  }

  function initObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        requestAnimationFrame(scanPosts);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }

  function injectBanner() {
    if (document.querySelector(".linkedout-banner")) return;

    const banner = document.createElement("div");
    banner.className = "linkedout-banner";
    banner.innerHTML =
      '<span class="linkedout-banner-text">LinkedOut is active &mdash; auto-translating</span>';

    const dismiss = document.createElement("button");
    dismiss.className = "linkedout-banner-dismiss";
    dismiss.textContent = "\u00d7";
    dismiss.addEventListener("click", () => banner.remove());
    banner.appendChild(dismiss);

    const feed = getMainFeed() || document.body;
    feed.prepend(banner);
  }

  function applyHideOriginalToAll(shouldHide) {
    const cards = getMainFeed()?.querySelectorAll(`[${PROCESSED_ATTR}]`) || [];
    cards.forEach((postEl) => {
      if (!postEl.querySelector(".linkedout-card")) return;
      const wrapper = postEl.querySelector(".linkedout-wrapper");
      if (!wrapper) return;
      const previous = wrapper.previousElementSibling;
      if (previous instanceof HTMLElement) {
        previous.style.display = shouldHide ? "none" : "";
      }
    });
  }

  function removeBanner() {
    document.querySelectorAll(".linkedout-banner").forEach((el) => el.remove());
  }

  // --- Init ---

  async function init() {
    LOG("Initializing on", window.location.href);

    const settings = await LinkedOutTranslator.getSettings();
    autoTranslate = settings.autoTranslate;
    hideOriginal = settings.hideOriginal;
    removePromoted = settings.removePromoted !== false;

    LOG("Settings:", {
      autoTranslate,
      hideOriginal,
      removePromoted,
      tone: settings.tone,
      provider: settings.provider,
      hasKey: !!settings.apiKey,
    });

    if (autoTranslate) injectBanner();
    mountHud();
    await refreshHudValues();

    // LinkedIn SDUI renders progressively — stagger initial scans
    setTimeout(scanPosts, 1500);
    setTimeout(scanPosts, 4000);
    setTimeout(scanPosts, 8000);

    initObserver();
    setInterval(scanPosts, RESCAN_INTERVAL_MS);

    let scrollTimer = null;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(scanPosts, 300);
      },
      { passive: true }
    );

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.linkedout_settings) {
        const newSettings = changes.linkedout_settings.newValue;
        const wasAuto = autoTranslate;
        const wasHiding = hideOriginal;
        const wasRemovePromoted = removePromoted;
        autoTranslate = newSettings.autoTranslate;
        hideOriginal = newSettings.hideOriginal;
        removePromoted = newSettings.removePromoted !== false;

        if (hideOriginal !== wasHiding) {
          applyHideOriginalToAll(hideOriginal);
        }

        if (autoTranslate && !wasAuto) {
          injectBanner();
          document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => {
            el.removeAttribute(PROCESSED_ATTR);
          });
          document
            .querySelectorAll(
              ".linkedout-wrapper, .linkedout-card, .linkedout-btn"
            )
            .forEach((el) => el.remove());
          scanPosts();
        } else if (!autoTranslate && wasAuto) {
          removeBanner();
        }

        if (wasRemovePromoted && !removePromoted) {
          document
            .querySelectorAll("[data-linkedout-promoted-removed='1']")
            .forEach((el) => {
              el.style.display = "";
              el.removeAttribute("data-linkedout-promoted-removed");
            });
        } else if (!wasRemovePromoted && removePromoted) {
          scanPosts();
        }
        refreshHudValues();
      }

      if (area === "local" && changes.linkedout_stats) {
        refreshHudValues();
      }
    });

    LOG("Ready. Monitoring feed.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
