import { createAIConfig, SdetFlowAIClient, OpenAIProvider, GeminiProvider } from '../dist/index.js';

const providers = [];
const targets = [];
if (process.env.OPENAI_API_KEY && process.env.SDETFLOW_OPENAI_MODEL) {
  providers.push(new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY }));
  targets.push({ provider: 'openai', model: process.env.SDETFLOW_OPENAI_MODEL });
}
if (process.env.GEMINI_API_KEY && process.env.SDETFLOW_GEMINI_MODEL) {
  providers.push(new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY }));
  targets.push({ provider: 'gemini', model: process.env.SDETFLOW_GEMINI_MODEL });
}
if (!targets.length) throw new Error('No approved live provider/model is configured. Set repository secrets and model variables.');

for (const target of targets) {
  const config = createAIConfig({
    enabled: true,
    requestTimeoutMs: 30_000,
    retry: { maxAttemptsPerTarget: 1 },
    budget: { maxInputChars: 2_000, maxOutputTokens: 100, maxEstimatedCostUsdPerCall: 0.10 },
    routes: [{ task: 'general', targets: [target] }]
  });
  const client = new SdetFlowAIClient({ config, providers });
  const result = await client.generate({ task: 'general', input: 'Return exactly the word OK.', maxOutputTokens: 20 });
  if (!result.text || !result.provider || !result.model) throw new Error(`Invalid live response from ${target.provider}`);
  console.log(`LIVE-CONTRACT PASS ${result.provider}/${result.model} ${result.latencyMs}ms`);
}
