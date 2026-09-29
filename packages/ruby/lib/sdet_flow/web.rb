module SdetFlow
  module Web
    class Actions
      def initialize(adapter:, retry_config: {})
        @adapter = adapter
        @retry_config = { max_attempts: 2, base_delay: 0.1, max_delay: 0.5 }.merge(retry_config)
      end

      def click(candidates)
        try_candidates(:click, candidates)
      end

      def fill(candidates, value)
        try_candidates(:fill, candidates, value)
      end

      private

      def try_candidates(action, candidates, *args)
        errors = []
        candidates.each do |candidate|
          begin
            locator = @adapter.locate(candidate)
            @adapter.public_send(action, locator, *args)
            return { candidate: candidate, errors: errors }
          rescue StandardError => e
            errors << { candidate: candidate, error: Redactor.redact(e.message) }
          end
        end
        raise "SDETFlow web #{action} failed for all candidates: #{errors.inspect}"
      end
    end
  end
end
