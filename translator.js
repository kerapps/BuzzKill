const LinkedOutTranslator = (() => {
  const TONE_PROMPTS = {
    blunt: `You are LinkedOut, a corporate BS translator. Your job is to take LinkedIn posts and reveal what the person ACTUALLY means in brutally honest, no-sugar-coating language.

Rules:
- Strip all corporate jargon, humble-brags, and hype-driven messaging
- Be direct and blunt — say what they really mean
- If the post contains genuine useful information, preserve it plainly
- Keep translations shorter than the original
- Never add hashtags or emojis
- Return ONLY the translated text, no preamble or explanation`,

    sarcastic: `You are LinkedOut, a corporate BS translator. Your job is to take LinkedIn posts and reveal what the person ACTUALLY means, with dry wit and sarcasm.

Rules:
- Decode the corporate jargon with sharp, witty commentary
- Add dry humor — expose the absurdity without being mean-spirited
- If the post contains genuine useful information, preserve it with a lighter touch
- Keep translations shorter than the original
- Never add hashtags or emojis
- Return ONLY the translated text, no preamble or explanation`,

    neutral: `You are LinkedOut, a corporate BS translator. Your job is to take LinkedIn posts and rewrite them in plain, clear English without corporate jargon.

Rules:
- Replace all corporate speak with straightforward language
- Maintain a neutral, matter-of-fact tone
- If the post contains genuine useful information, preserve it clearly
- Keep translations shorter than the original
- Never add hashtags or emojis
- Return ONLY the translated text, no preamble or explanation`,
  };

  const cache = new Map();
  const postCache = new Map();

  async function hashText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function loadCache() {
    try {
      const result = await chrome.storage.local.get("linkedout_cache");
      if (result.linkedout_cache) {
        const entries = JSON.parse(result.linkedout_cache);
        for (const [k, v] of entries) {
          cache.set(k, v);
        }
      }
    } catch {
      // cache miss is fine
    }
  }

  async function loadPostCache() {
    try {
      const result = await chrome.storage.local.get("linkedout_post_cache");
      if (result.linkedout_post_cache) {
        const entries = JSON.parse(result.linkedout_post_cache);
        for (const [k, v] of entries) {
          postCache.set(k, v);
        }
      }
    } catch {
      // post cache miss is fine
    }
  }

  async function persistCache() {
    const entries = Array.from(cache.entries()).slice(-500); // keep last 500
    await chrome.storage.local.set({
      linkedout_cache: JSON.stringify(entries),
    });
  }

  async function persistPostCache() {
    const entries = Array.from(postCache.entries()).slice(-1000);
    await chrome.storage.local.set({
      linkedout_post_cache: JSON.stringify(entries),
    });
  }

  async function getSettings() {
    const defaults = {
      provider: "openai",
      apiKey: "",
      tone: "blunt",
      autoTranslate: false,
      hideOriginal: false,
      removePromoted: true,
    };
    const result = await chrome.storage.sync.get("linkedout_settings");
    return { ...defaults, ...result.linkedout_settings };
  }

  function linkedinSpeakPrompt() {
    return `You are a LinkedIn corporate messaging assistant.

Transform plain, honest text into polished LinkedIn-style corporate speak.

Rules:
- Keep the core meaning of the original text
- Sound upbeat, professional, and slightly self-promotional
- Use concise, readable language
- You may add 1-2 tasteful hashtags at the end
- Do NOT invent facts
- Return ONLY the rewritten post text`;
  }

  function humanTranslatePrompt(tone) {
    return TONE_PROMPTS[tone] || TONE_PROMPTS.blunt;
  }

  async function sendToProvider({
    provider,
    apiKey,
    systemPrompt,
    postText,
  }) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "TRANSLATE",
          payload: {
            provider,
            apiKey,
            systemPrompt,
            postText,
          },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!response || !response.success) {
            reject(new Error(response?.error || "Translation failed"));
            return;
          }

          resolve({
            text: response.translation,
            usageTokens: response.usageTokens || 0,
          });
        }
      );
    });
  }

  async function translate(postText, options = {}) {
    const settings = await getSettings();

    if (!settings.apiKey) {
      throw new Error(
        "No API key configured. Click the LinkedOut icon to set one up."
      );
    }

    const tone = settings.tone || "blunt";
    const textHash = await hashText(postText);
    const cacheKey = await hashText(`${tone}:${postText}`);
    const postId = options.postId || null;

    if (postId) {
      const postCacheKey = `${tone}:${postId}`;
      const postEntry = postCache.get(postCacheKey);
      if (postEntry && postEntry.textHash === textHash) {
        return postEntry.translation;
      }
    }

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const systemPrompt = humanTranslatePrompt(tone);
    const result = await sendToProvider({
      provider: settings.provider,
      apiKey: settings.apiKey,
      systemPrompt,
      postText,
    });

    cache.set(cacheKey, result.text);
    persistCache();

    if (postId) {
      const postCacheKey = `${tone}:${postId}`;
      postCache.set(postCacheKey, {
        translation: result.text,
        textHash,
        updatedAt: Date.now(),
      });
      persistPostCache();
    }

    updateStats({ translatedInc: 1, tokensInc: result.usageTokens });
    return result.text;
  }

  async function linkedinize(text) {
    const settings = await getSettings();
    if (!settings.apiKey) {
      throw new Error(
        "No API key configured. Click the LinkedOut icon to set one up."
      );
    }

    const cacheKey = await hashText(`linkedinize:${text}`);
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = await sendToProvider({
      provider: settings.provider,
      apiKey: settings.apiKey,
      systemPrompt: linkedinSpeakPrompt(),
      postText: text,
    });

    cache.set(cacheKey, result.text);
    persistCache();
    updateStats({ tokensInc: result.usageTokens });
    return result.text;
  }

  async function updateStats({ translatedInc = 0, tokensInc = 0 } = {}) {
    const result = await chrome.storage.local.get("linkedout_stats");
    const stats = result.linkedout_stats || {
      translated: 0,
      total_tokens: 0,
      session_start: Date.now(),
    };
    stats.translated += translatedInc;
    stats.total_tokens = (stats.total_tokens || 0) + tokensInc;
    await chrome.storage.local.set({ linkedout_stats: stats });
  }

  loadCache();
  loadPostCache();

  return { translate, linkedinize, getSettings, TONE_PROMPTS };
})();
