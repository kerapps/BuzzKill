const LinkedOutConfig = {
  models: {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-latest",
  },

  rates: {
    openai: { input: 0.15, output: 0.6 },
    anthropic: { input: 1.0, output: 5.0 },
  },

  modelForProvider(provider) {
    return this.models[provider] || this.models.openai;
  },

  rateForProvider(provider) {
    return this.rates[provider] || this.rates.openai;
  },

  linkedinizePrompt: `Rewrite this plain text into polished LinkedIn corporate-speak. Write in first person.

Rules:
- Keep the core meaning of the original text
- Sound upbeat, professional, and slightly self-promotional
- Use concise, readable language
- You may add 1-2 tasteful hashtags at the end
- Do NOT invent facts
- Same language as input (EN→EN, FR→FR, ES→ES — never switch)
- Return ONLY the rewritten post text`,
};
