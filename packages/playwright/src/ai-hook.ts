import { buildDiagnosticContext } from './diagnostics.js';
import type {
  AIAnalyzer,
  AIHookResult,
  PageLike,
  SdetFlowPlaywrightConfig,
  TestInfoLike,
} from './types.js';

export interface AnalyzeFailureInput {
  page?: PageLike;
  testInfo?: TestInfoLike;
  error?: unknown;
  analyzer?: AIAnalyzer;
  evidence?: import('./types.js').EvidenceBuffer;
}

export async function analyzeFailureIfEnabled(
  input: AnalyzeFailureInput,
  config: Readonly<SdetFlowPlaywrightConfig>,
): Promise<AIHookResult> {
  if (!config.ai.enabled || !input.analyzer) return { invoked: false };

  try {
    const context = await buildDiagnosticContext(input, config.redaction, config.ai.includeDom, config.artifacts.maxDomChars, config.artifacts.maxLogEntries);
    const result = await input.analyzer.analyzeFailure(context);
    return { invoked: true, result };
  } catch (error) {
    return {
      invoked: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
