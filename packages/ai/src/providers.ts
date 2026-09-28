import { AIProviderError } from './errors.js';
import type { AIProvider, GenerationRequest, GenerationResult } from './types.js';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

function parseJsonSafely(text: string): unknown { try { return JSON.parse(text); } catch { return undefined; } }
function retryableStatus(status: number): boolean { return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500; }

function openAIText(body: any): string {
  if (typeof body?.output_text === 'string') return body.output_text;
  const chunks: string[] = [];
  for (const item of body?.output ?? []) for (const content of item?.content ?? []) if (typeof content?.text === 'string') chunks.push(content.text);
  return chunks.join('\n');
}

function geminiText(body: any): string {
  if (typeof body?.output_text === 'string') return body.output_text;
  if (typeof body?.outputText === 'string') return body.outputText;
  const chunks: string[] = [];
  for (const step of body?.steps ?? []) {
    if (step?.type !== 'model_output') continue;
    for (const content of step?.content ?? []) if (typeof content?.text === 'string') chunks.push(content.text);
  }
  return chunks.join('\n');
}

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai' as const;
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly fetcher: FetchLike;
  private readonly organization: string | undefined;
  private readonly project: string | undefined;

  public constructor(options: { apiKey: string; endpoint?: string; fetcher?: FetchLike; organization?: string; project?: string }) {
    if (!options.apiKey) throw new Error('OpenAI apiKey is required');
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint ?? 'https://api.openai.com/v1/responses';
    this.fetcher = options.fetcher ?? fetch;
    this.organization = options.organization;
    this.project = options.project;
  }

  public async generate(model: string, request: GenerationRequest, signal?: AbortSignal): Promise<GenerationResult> {
    const started = Date.now();
    const headers: Record<string, string> = { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` };
    if (this.organization) headers['OpenAI-Organization'] = this.organization;
    if (this.project) headers['OpenAI-Project'] = this.project;
    const response = await this.fetcher(this.endpoint, {
      method: 'POST', headers,
      body: JSON.stringify({
        model,
        input: request.input,
        ...(request.system ? { instructions: request.system } : {}),
        ...(request.maxOutputTokens ? { max_output_tokens: request.maxOutputTokens } : {}),
        store: false,
        ...(request.metadata ? { metadata: request.metadata } : {}),
      }),
      ...(signal ? { signal } : {}),
    });
    const raw = await response.text();
    const body: any = parseJsonSafely(raw);
    if (!response.ok) {
      const message = body?.error?.message ?? `OpenAI request failed with HTTP ${response.status}`;
      throw new AIProviderError(this.name, message, { status: response.status, retryable: retryableStatus(response.status) });
    }
    const text = openAIText(body);
    if (!text) throw new AIProviderError(this.name, 'OpenAI response did not contain text output', { retryable: false });
    const inputTokens = body?.usage?.input_tokens;
    const outputTokens = body?.usage?.output_tokens;
    const totalTokens = body?.usage?.total_tokens ?? (typeof inputTokens === 'number' && typeof outputTokens === 'number' ? inputTokens + outputTokens : undefined);
    return {
      provider: this.name, model: body?.model ?? model, text,
      usage: { ...(typeof inputTokens === 'number' ? { inputTokens } : {}), ...(typeof outputTokens === 'number' ? { outputTokens } : {}), ...(typeof totalTokens === 'number' ? { totalTokens } : {}) },
      latencyMs: Date.now() - started,
      ...(typeof body?.id === 'string' ? { requestId: body.id } : {}),
    };
  }
}

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini' as const;
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly fetcher: FetchLike;
  public constructor(options: { apiKey: string; endpoint?: string; fetcher?: FetchLike }) {
    if (!options.apiKey) throw new Error('Gemini apiKey is required');
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint ?? 'https://generativelanguage.googleapis.com/v1/interactions';
    this.fetcher = options.fetcher ?? fetch;
  }
  public async generate(model: string, request: GenerationRequest, signal?: AbortSignal): Promise<GenerationResult> {
    const started = Date.now();
    const response = await this.fetcher(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({ model, input: request.system ? `${request.system}\n\n${request.input}` : request.input, store: false }),
      ...(signal ? { signal } : {}),
    });
    const raw = await response.text();
    const body: any = parseJsonSafely(raw);
    if (!response.ok) {
      const message = body?.error?.message ?? `Gemini request failed with HTTP ${response.status}`;
      throw new AIProviderError(this.name, message, { status: response.status, retryable: retryableStatus(response.status) });
    }
    const text = geminiText(body);
    if (!text) throw new AIProviderError(this.name, 'Gemini response did not contain text output', { retryable: false });
    const usage = body?.usage ?? body?.usage_metadata ?? body?.usageMetadata ?? {};
    const inputTokens = usage?.total_input_tokens ?? usage?.prompt_token_count ?? usage?.promptTokenCount;
    const outputTokens = usage?.total_output_tokens ?? usage?.candidates_token_count ?? usage?.candidatesTokenCount;
    const totalTokens = usage?.total_tokens ?? usage?.totalTokenCount ?? (typeof inputTokens === 'number' && typeof outputTokens === 'number' ? inputTokens + outputTokens : undefined);
    return {
      provider: this.name, model: body?.model ?? body?.model_version ?? model, text,
      usage: { ...(typeof inputTokens === 'number' ? { inputTokens } : {}), ...(typeof outputTokens === 'number' ? { outputTokens } : {}), ...(typeof totalTokens === 'number' ? { totalTokens } : {}) },
      latencyMs: Date.now() - started,
      ...(typeof body?.id === 'string' ? { requestId: body.id } : {}),
    };
  }
}

export class FakeProvider implements AIProvider {
  public readonly name: string;
  private readonly handler: (model: string, request: GenerationRequest) => Promise<GenerationResult>;
  public constructor(name: string, handler: (model: string, request: GenerationRequest) => Promise<GenerationResult>) { this.name = name; this.handler = handler; }
  public generate(model: string, request: GenerationRequest): Promise<GenerationResult> { return this.handler(model, request); }
}
