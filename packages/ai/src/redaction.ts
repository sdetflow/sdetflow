import type { PrivacyPolicy } from './types.js';

const PREFIX_PATTERNS = [
  /(authorization\s*[:=]\s*bearer\s+)([^\s,;]+)/gi,
  /(bearer\s+)([A-Za-z0-9._~+\/-]+=*)/gi,
  /((?:api[_-]?key|apikey|password|passwd|pwd|secret|access[_-]?token|refresh[_-]?token|client[_-]?secret)\s*["']?\s*[:=]\s*["']?)([^\s,"';}\]]+)/gi,
  /((?:cookie|set-cookie)\s*:\s*)([^\r\n]+)/gi,
  /((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^:\s/@]+:)([^@\s/]+)(@)/gi,
];
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const OPENAI_KEY = /\bsk-[A-Za-z0-9_-]{16,}\b/g;
const GOOGLE_KEY = /\bAIza[A-Za-z0-9_-]{20,}\b/g;
const AWS_KEY = /\bAKIA[0-9A-Z]{16}\b/g;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL = /https?:\/\/[^\s"'<>]+/gi;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function groupReplace(input: string, pattern: RegExp, replacement: string): string {
  return input.replace(pattern, (...args: unknown[]) => {
    const prefix = typeof args[1] === 'string' ? args[1] : '';
    const suffix = typeof args[3] === 'string' ? args[3] : '';
    return `${prefix}${replacement}${suffix}`;
  });
}

export function redact(input: string, policy: PrivacyPolicy): string {
  let output = input;
  for (const pattern of PREFIX_PATTERNS) output = groupReplace(output, pattern, policy.replacement);
  output = output.replace(JWT, policy.replacement).replace(OPENAI_KEY, policy.replacement).replace(GOOGLE_KEY, policy.replacement).replace(AWS_KEY, policy.replacement);
  if (policy.redactEmails) output = output.replace(EMAIL, policy.replacement);
  if (policy.redactUrls) output = output.replace(URL, policy.replacement);
  if (policy.redactIpAddresses) output = output.replace(IPV4, policy.replacement);
  for (const pattern of policy.customPatterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    output = output.replace(new RegExp(pattern.source, flags), policy.replacement);
  }
  return output;
}

export function redactUnknown(value: unknown, policy: PrivacyPolicy, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return redact(value, policy);
  if (Array.isArray(value)) return value.map((item) => redactUnknown(item, policy, seen));
  if (value && typeof value === 'object') {
    if (seen.has(value)) return '[CIRCULAR]';
    seen.add(value);
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (/password|passwd|pwd|secret|token|api.?key|authorization|cookie/i.test(key)) out[key] = policy.replacement;
      else out[key] = redactUnknown(nested, policy, seen);
    }
    return out;
  }
  return value;
}
