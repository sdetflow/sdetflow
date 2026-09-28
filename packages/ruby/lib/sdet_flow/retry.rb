module SdetFlow
  module Retry
    module_function

    def call(max_attempts:, base_delay:, max_delay:, factor: 2.0, sleep_fn: Kernel.method(:sleep), retry_if: nil, on_retry: nil)
      raise ArgumentError, 'max_attempts must be >= 1' if max_attempts.to_i < 1
      attempt = 0
      begin
        attempt += 1
        return yield(attempt)
      rescue StandardError => e
        raise if attempt >= max_attempts || (retry_if && !retry_if.call(e, attempt))
        delay = [max_delay.to_f, base_delay.to_f * (factor.to_f**(attempt - 1))].min
        on_retry&.call(error: e, attempt: attempt, next_delay: delay)
        sleep_fn.call(delay)
        retry
      end
    end
  end
end
