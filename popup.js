const $ = (id) => document.getElementById(id);

const DEFAULTS = {
  provider: "openai",
  apiKey: "",
  tone: "blunt",
  autoTranslate: false,
  hideOriginal: false,
  removePromoted: true,
};

async function loadSettings() {
  const result = await chrome.storage.sync.get("linkedout_settings");
  const settings = { ...DEFAULTS, ...result.linkedout_settings };

  $("provider").value = settings.provider;
  $("apiKey").value = settings.apiKey;
  $("tone").value = settings.tone;
  $("autoTranslate").checked = settings.autoTranslate;
  $("hideOriginal").checked = settings.hideOriginal;
  $("removePromoted").checked = settings.removePromoted;
}

async function saveSettings() {
  const settings = {
    provider: $("provider").value,
    apiKey: $("apiKey").value,
    tone: $("tone").value,
    autoTranslate: $("autoTranslate").checked,
    hideOriginal: $("hideOriginal").checked,
    removePromoted: $("removePromoted").checked,
  };

  await chrome.storage.sync.set({ linkedout_settings: settings });

  const status = $("saveStatus");
  status.textContent = "Saved!";
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

async function loadStats() {
  const result = await chrome.storage.local.get("linkedout_stats");
  const stats = result.linkedout_stats || { translated: 0, total_tokens: 0 };
  $("statTranslated").textContent = stats.translated;
  $("statTokens").textContent = stats.total_tokens || 0;
}

$("saveBtn").addEventListener("click", saveSettings);

$("toggleKeyVisibility").addEventListener("click", () => {
  const input = $("apiKey");
  input.type = input.type === "password" ? "text" : "password";
});

loadSettings();
loadStats();
