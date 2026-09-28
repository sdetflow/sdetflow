import { analyzeFailureIfEnabled } from './ai-hook.js';
import { captureFailureDiagnostics, type CaptureResult } from './diagnostics.js';
import { EvidenceCollector } from './evidence.js';
import { SmartLocator } from './smart-locator.js';
import type { AIAnalyzer, AIHookResult, PageLike, SdetFlowPlaywrightConfig, TestInfoLike } from './types.js';
export class SdetFlowSession {
  public readonly evidence:EvidenceCollector;
  public readonly locator:SmartLocator;
  public constructor(public readonly page:PageLike,public readonly config:Readonly<SdetFlowPlaywrightConfig>,private readonly analyzer?:AIAnalyzer){this.evidence=new EvidenceCollector(config.artifacts.maxLogEntries,config.redaction);this.locator=new SmartLocator(page,{policy:config.smartLocator,redaction:config.redaction,onTelemetry:e=>this.evidence.locator(e)})}
  public async onFailure(error:unknown,testInfo?:TestInfoLike):Promise<{capture:CaptureResult;ai:AIHookResult}>{const evidence=this.evidence.snapshot();const base={page:this.page,error,evidence,...(testInfo===undefined?{}:{testInfo})};const capture=await captureFailureDiagnostics(base,this.config);const ai=await analyzeFailureIfEnabled({...base,...(this.analyzer===undefined?{}:{analyzer:this.analyzer})},this.config);return{capture,ai}}
}
