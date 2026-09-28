export type LocatorStrategy = 'testId' | 'role' | 'label' | 'text' | 'css';
export interface LoggerLike { debug?(message:string,data?:unknown):void; info?(message:string,data?:unknown):void; warn?(message:string,data?:unknown):void; error?(message:string,data?:unknown):void; }
export interface LocatorLike { click(options?:{timeout?:number}):Promise<void>; fill(value:string,options?:{timeout?:number}):Promise<void>; count?():Promise<number>; }
export interface PageLike {
  getByTestId?(testId:string):LocatorLike; getByRole?(role:string,options?:{name?:string|RegExp;exact?:boolean}):LocatorLike;
  getByLabel?(text:string|RegExp,options?:{exact?:boolean}):LocatorLike; getByText?(text:string|RegExp,options?:{exact?:boolean}):LocatorLike;
  locator?(selector:string):LocatorLike; url?():string; title?():Promise<string>; content?():Promise<string>; screenshot?(options?:{fullPage?:boolean}):Promise<Uint8Array>;
}
export interface TestInfoLike { title?:string; status?:string; expectedStatus?:string; retry?:number; duration?:number; project?:{name?:string}; attach?(name:string,options:{body:string|Uint8Array;contentType:string}):Promise<void>; }
export interface SmartLocatorTarget { testId?:string; role?:string; roleName?:string|RegExp; label?:string|RegExp; text?:string|RegExp; css?:string; exact?:boolean; description?:string; }
export interface LocatorAttempt { strategy:LocatorStrategy; success:boolean; durationMs:number; error?:string; }
export interface LocatorTelemetry { operation:'resolve'|'click'|'fill'; description?:string; selectedStrategy?:LocatorStrategy; attempts:LocatorAttempt[]; }
export interface RetryPolicy { maxAttempts:number; baseDelayMs:number; maxDelayMs:number; factor:number; jitterRatio:number; }
export interface ArtifactPolicy { attachMetadata:boolean; screenshotOnFailure:boolean; includeDom:boolean; fullPageScreenshot:boolean; maxDomChars:number; maxLogEntries:number; }
export interface RedactionPolicy { redactEmails:boolean; redactUrls:boolean; redactIpAddresses:boolean; replacement:string; customPatterns:RegExp[]; }
export interface SmartLocatorPolicy { enabled:boolean; timeoutMs:number; order:LocatorStrategy[]; }
export interface AIHookPolicy { enabled:boolean; includeDom:boolean; }
export interface SdetFlowPlaywrightConfig { smartLocator:SmartLocatorPolicy; retry:RetryPolicy; artifacts:ArtifactPolicy; redaction:RedactionPolicy; ai:AIHookPolicy; }
export interface DiagnosticContext {
  schemaVersion:'1.1'; test:{title?:string;status?:string;expectedStatus?:string;retry?:number;durationMs?:number;project?:string};
  page:{url?:string;title?:string}; error?:string; dom?:string; console?:string[]; network?:string[]; locatorTelemetry?:LocatorTelemetry[];
  capturedAt:string; redactionApplied:true;
}
export interface AIAnalyzer { analyzeFailure(context:DiagnosticContext):Promise<unknown>; }
export interface AIHookResult { invoked:boolean; result?:unknown; error?:string; }
export interface EvidenceBuffer { console:string[]; network:string[]; locators:LocatorTelemetry[]; }
