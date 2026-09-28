module SdetFlow
  class Config
    attr_reader :environment, :request_timeout, :retry_max_attempts, :retry_base_delay, :retry_max_delay,
                :ai_enabled, :capture_dom, :screenshot_on_failure

    def initialize(environment: 'test', request_timeout: 20, retry_max_attempts: 3,
                   retry_base_delay: 0.2, retry_max_delay: 2.0,
                   ai_enabled: false, capture_dom: false, screenshot_on_failure: true)
      raise ArgumentError, 'environment is required' if environment.to_s.strip.empty?
      raise ArgumentError, 'request_timeout must be > 0' unless request_timeout.to_f.positive?
      raise ArgumentError, 'retry_max_attempts must be >= 1' unless retry_max_attempts.to_i >= 1
      raise ArgumentError, 'retry delays are invalid' if retry_base_delay.to_f.negative? || retry_max_delay.to_f < retry_base_delay.to_f

      @environment = environment.to_s.freeze
      @request_timeout = request_timeout.to_f
      @retry_max_attempts = retry_max_attempts.to_i
      @retry_base_delay = retry_base_delay.to_f
      @retry_max_delay = retry_max_delay.to_f
      @ai_enabled = !!ai_enabled
      @capture_dom = !!capture_dom
      @screenshot_on_failure = !!screenshot_on_failure
      freeze
    end

    def self.from_env(env = ENV)
      new(
        environment: env.fetch('SDETFLOW_ENV', 'test'),
        request_timeout: env.fetch('SDETFLOW_REQUEST_TIMEOUT', '20').to_f,
        retry_max_attempts: env.fetch('SDETFLOW_RETRY_MAX_ATTEMPTS', '3').to_i,
        ai_enabled: parse_bool(env['SDETFLOW_AI_ENABLED'], false),
        capture_dom: parse_bool(env['SDETFLOW_CAPTURE_DOM'], false),
        screenshot_on_failure: parse_bool(env['SDETFLOW_SCREENSHOT_ON_FAILURE'], true)
      )
    end

    def self.parse_bool(value, default)
      return default if value.nil?
      normalized = value.to_s.strip.downcase
      return true if %w[1 true yes on].include?(normalized)
      return false if %w[0 false no off].include?(normalized)
      raise ArgumentError, "invalid boolean: #{value}"
    end
    private_class_method :parse_bool
  end
end
