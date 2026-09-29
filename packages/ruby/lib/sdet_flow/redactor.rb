module SdetFlow
  module Redactor
    PREFIX_PATTERNS = [
      /(authorization\s*[:=]\s*(?:bearer|basic)\s+)([^\s,;]+)/i,
      /(bearer\s+)([A-Za-z0-9._~+\/\-=]+)/i,
      /((?:api[_-]?key|apikey|password|passwd|pwd|secret|access[_-]?token|refresh[_-]?token|client[_-]?secret)\s*["']?\s*[:=]\s*["']?)([^\s,"';}\]]+)/i,
      /((?:cookie|set-cookie)\s*:\s*)([^\r\n]+)/i
    ].freeze
    TOKEN_PATTERNS = [/\bsk-[A-Za-z0-9_-]{16,}\b/, /\bAIza[A-Za-z0-9_-]{20,}\b/, /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/].freeze
    module_function
    def redact(value, replacement: '[REDACTED]', custom_patterns: [])
      return value unless value.is_a?(String)
      output = value.dup
      PREFIX_PATTERNS.each { |pattern| output.gsub!(pattern) { "#{Regexp.last_match(1)}#{replacement}" } }
      TOKEN_PATTERNS.each { |pattern| output.gsub!(pattern, replacement) }
      custom_patterns.each { |pattern| output.gsub!(pattern, replacement) }
      output
    end
    def redact_object(value, replacement: '[REDACTED]')
      case value
      when String then redact(value, replacement: replacement)
      when Array then value.map { |v| redact_object(v, replacement: replacement) }
      when Hash then value.each_with_object({}) { |(k,v),h| h[k] = k.to_s.match?(/password|secret|token|api.?key|authorization|cookie/i) ? replacement : redact_object(v, replacement: replacement) }
      else value
      end
    end
  end
end
