import {
  createAIConfig,
  FailureTriageAnalyzer,
  OpenAIProvider,
  GeminiProvider,
  SdetFlowAIClient,
} from '@sdetflow/ai';

const config = createAIConfig({
  enabled: true,
  routes: [{
    task: 'failure-triage',
    targets: [
      { provider: 'openai', model: process.env.OPENAI_MODEL ?? '' },
      { provider: 'gemini', model: process.env.GEMINI_MODEL ?? '' },
    ],
  }],
});

const client = new SdetFlowAIClient({
  config,
  providers: [
    new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY ?? '' }),
    new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY ?? '' }),
  ],
});

const analyzer = new FailureTriageAnalyzer(client);
console.log(await analyzer.analyze({
  testName: 'sample checkout',
  error: 'Timeout waiting for iframe',
  logs: ['payment API 200'],
}));
