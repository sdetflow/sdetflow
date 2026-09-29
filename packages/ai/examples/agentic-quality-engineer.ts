import {
  AgenticQualityEngineer,
  OpenAIProvider,
  SdetFlowAIClient,
  createAIConfig,
} from '@sdetflow/ai';

const config = createAIConfig({
  enabled: true,
  routes: [{
    task: 'agentic-orchestration',
    targets: [{ provider: 'openai', model: process.env.SDETFLOW_OPENAI_MODEL ?? 'gpt-5.6' }],
  }],
  budget: { maxEstimatedCostUsdPerCall: 0.03, maxEstimatedCostUsdPerDay: 1 },
});

const client = new SdetFlowAIClient({
  config,
  providers: [new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! })],
});

const agent = new AgenticQualityEngineer({
  client,
  tools: [{
    name: 'read-test-result',
    description: 'Read a previously collected, non-secret test-result summary by id.',
    sensitivity: 'low',
    validate: (input) => {
      if (!input || typeof input !== 'object' || typeof (input as { id?: unknown }).id !== 'string') {
        throw new Error('id must be a string');
      }
    },
    execute: async (input) => {
      const { id } = input as { id: string };
      // Replace with your own read-only result store. Never return secrets.
      return { id, status: 'failed', error: 'Timeout waiting for checkout iframe' };
    },
  }],
  // High-sensitivity tools are denied by default unless an approval handler is supplied.
});

const result = await agent.run({
  goal: 'Review test result run-1042 and summarize the safest next investigation step.',
});

console.log(result);
