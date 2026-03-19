const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const queue = [];
let activeRequests = 0;
const MAX_CONCURRENT = 3;
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

async function callOpenAI(apiKey, systemPrompt, postText) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
  return {
    text: data.choices?.[0]?.message?.content?.trim() || "",
    usageTokens: data.usage?.total_tokens || 0,
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
      model: "claude-3-5-haiku-latest",
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
  };
}

async function handleTranslation({ provider, apiKey, systemPrompt, postText }) {
  if (provider === "anthropic") {
    const result = await callAnthropic(apiKey, systemPrompt, postText);
    return { translation: result.text, usageTokens: result.usageTokens };
  }
  const result = await callOpenAI(apiKey, systemPrompt, postText);
  return { translation: result.text, usageTokens: result.usageTokens };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TRANSLATE") {
    queue.push({ request: message.payload, sendResponse });
    processQueue();
    return true; // keep message channel open for async response
  }

  if (message.type === "PING") {
    sendResponse({ status: "ok" });
    return false;
  }
});
