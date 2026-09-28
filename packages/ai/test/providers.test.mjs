import test from 'node:test';
import assert from 'node:assert/strict';
import { OpenAIProvider, GeminiProvider, AIProviderError } from '../dist/index.js';

test('OpenAI provider uses Responses API shape and does not put key in body', async () => {
  let captured;
  const provider = new OpenAIProvider({
    apiKey: 'OPENAI_SECRET',
    fetcher: async (url, init) => {
      captured = { url, init };
      return new Response(JSON.stringify({ id: 'resp_1', model: 'm', output_text: 'ok', usage: { input_tokens: 10, output_tokens: 3 } }), { status: 200 });
    },
  });
  const result = await provider.generate('m', { task: 'general', input: 'hello', system: 'system' });
  assert.equal(captured.url, 'https://api.openai.com/v1/responses');
  assert.equal(captured.init.headers.authorization, 'Bearer OPENAI_SECRET');
  assert.equal(captured.init.body.includes('OPENAI_SECRET'), false);
  assert.equal(JSON.parse(captured.init.body).store, false);
  assert.equal(result.text, 'ok');
  assert.equal(result.usage.totalTokens, 13);
});

test('OpenAI non-retryable 400 becomes provider error', async () => {
  const provider = new OpenAIProvider({
    apiKey: 'x',
    fetcher: async () => new Response(JSON.stringify({ error: { message: 'bad request' } }), { status: 400 }),
  });
  await assert.rejects(provider.generate('m', { task: 'general', input: 'x' }), (err) => {
    assert.equal(err instanceof AIProviderError, true);
    assert.equal(err.retryable, false);
    return true;
  });
});

test('Gemini provider uses Interactions endpoint and x-goog-api-key', async () => {
  let captured;
  const provider = new GeminiProvider({
    apiKey: 'GEMINI_SECRET',
    fetcher: async (url, init) => {
      captured = { url, init };
      return new Response(JSON.stringify({ id: 'int_1', output_text: 'gemini ok' }), { status: 200 });
    },
  });
  const result = await provider.generate('gemini-model', { task: 'general', input: 'hello' });
  assert.equal(captured.url, 'https://generativelanguage.googleapis.com/v1/interactions');
  assert.equal(captured.init.headers['x-goog-api-key'], 'GEMINI_SECRET');
  assert.equal(captured.init.body.includes('GEMINI_SECRET'), false);
  assert.equal(JSON.parse(captured.init.body).store, false);
  assert.equal(result.text, 'gemini ok');
});

test('Gemini parses model_output steps as fallback', async () => {
  const provider = new GeminiProvider({
    apiKey: 'x',
    fetcher: async () => new Response(JSON.stringify({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'step text' }] }] }), { status: 200 }),
  });
  const result = await provider.generate('g', { task: 'general', input: 'hello' });
  assert.equal(result.text, 'step text');
});
