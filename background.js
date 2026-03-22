// Look at you! Looking at the code, you must be good!
// Sorry to disappoint you, but there are no LLM keys stored in this repo. Good try though!

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const MODELS = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
};

const queue = [];
let activeRequests = 0;
const MAX_CONCURRENT = 3;
const MAX_QUEUE_SIZE = 50;
const BATCH_DELAY_MS = 500;

function processQueue() {
  while (activeRequests < MAX_CONCURRENT && queue.length > 0) {
    const { request, sendResponse } = queue.shift();
    activeRequests++;
    handleTranslation(request)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
      .finally(() => {
        activeRequests--;
        setTimeout(processQueue, BATCH_DELAY_MS);
      });
  }
}

async function getApiKey() {
  const result = await chrome.storage.sync.get("linkedout_settings");
  return result.linkedout_settings?.apiKey || "";
}

async function callOpenAI(apiKey, systemPrompt, postText) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODELS.openai,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: postText },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body}`);
  }

  const data = await res.json();
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;
  return {
    text: data.choices?.[0]?.message?.content?.trim() || "",
    usageTokens: data.usage?.total_tokens || inputTokens + outputTokens,
    inputTokens,
    outputTokens,
  };
}

async function callAnthropic(apiKey, systemPrompt, postText) {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODELS.anthropic,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: postText }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic ${res.status}: ${body}`);
  }

  const data = await res.json();
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;
  return {
    text: data.content?.[0]?.text?.trim() || "",
    usageTokens: inputTokens + outputTokens,
    inputTokens,
    outputTokens,
  };
}

async function handleTranslation({ provider, apiKey, systemPrompt, postText }) {
  const key = apiKey || (await getApiKey());
  if (!key) throw new Error("No API key configured.");

  const call = provider === "anthropic" ? callAnthropic : callOpenAI;
  const result = await call(key, systemPrompt, postText);
  return {
    translation: result.text,
    usageTokens: result.usageTokens,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TRANSLATE") {
    if (queue.length >= MAX_QUEUE_SIZE) {
      sendResponse({ success: false, error: "Too many pending requests. Try again shortly." });
      return false;
    }
    queue.push({ request: message.payload, sendResponse });
    processQueue();
    return true;
  }

  if (message.type === "PING") {
    sendResponse({ status: "ok" });
    return false;
  }
});
