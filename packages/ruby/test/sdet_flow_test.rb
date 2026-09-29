require 'minitest/autorun'
$LOAD_PATH.unshift File.expand_path('../lib', __dir__)
require 'sdet_flow'

class SdetFlowTest < Minitest::Test
  def test_defaults_are_safe
    c = SdetFlow::Config.new
    refute c.ai_enabled
    refute c.capture_dom
    assert c.screenshot_on_failure
    assert c.frozen?
  end

  def test_env_boolean_parsing
    c = SdetFlow::Config.from_env('SDETFLOW_AI_ENABLED' => 'yes', 'SDETFLOW_CAPTURE_DOM' => '0')
    assert c.ai_enabled
    refute c.capture_dom
  end

  def test_redactor_masks_secrets
    s = SdetFlow::Redactor.redact('Authorization: Bearer ABC password=hunter2 api_key=XYZ')
    refute_includes s, 'ABC'
    refute_includes s, 'hunter2'
    refute_includes s, 'XYZ'
  end

  def test_retry_succeeds_after_transient_failures
    calls = 0
    sleeps = []
    result = SdetFlow::Retry.call(max_attempts: 3, base_delay: 0.1, max_delay: 1, sleep_fn: ->(v) { sleeps << v }) do
      calls += 1
      raise 'transient' if calls < 3
      :ok
    end
    assert_equal :ok, result
    assert_equal [0.1, 0.2], sleeps
  end

  def test_api_get_and_json
    calls = []
    transport = ->(**args) { calls << args; { status: 200, headers: {}, body: '{"ok":true}' } }
    client = SdetFlow::ApiClient.new(base_url: 'https://example.test', transport: transport)
    response = client.get('/health', query: { q: 'x' })
    response.expect_status(200)
    assert_equal true, response.json['ok']
    assert_equal :get, calls.first[:method]
    assert_equal 'q=x', calls.first[:uri].query
  end

  def test_post_is_not_retried_by_default
    calls = 0
    transport = ->(**_) { calls += 1; { status: 503, headers: {}, body: 'down' } }
    config = SdetFlow::Config.new(retry_max_attempts: 3, retry_base_delay: 0, retry_max_delay: 0)
    client = SdetFlow::ApiClient.new(base_url: 'https://example.test', config: config, transport: transport)
    assert_equal 503, client.post('/orders', json: { a: 1 }).status
    assert_equal 1, calls
  end

  def test_get_retries_retryable_status
    calls = 0
    transport = ->(**_) do
      calls += 1
      { status: calls < 3 ? 503 : 200, headers: {}, body: 'ok' }
    end
    config = SdetFlow::Config.new(retry_max_attempts: 3, retry_base_delay: 0, retry_max_delay: 0)
    client = SdetFlow::ApiClient.new(base_url: 'https://example.test', config: config, transport: transport)
    assert_equal 200, client.get('/health').status
    assert_equal 3, calls
  end

  def test_telemetry_redacts_query_secret
    events = []
    transport = ->(**_) { { status: 200, headers: {}, body: 'ok' } }
    client = SdetFlow::ApiClient.new(base_url: 'https://example.test', transport: transport, event_sink: ->(e) { events << e })
    client.get('/health', query: { api_key: 'SECRET' })
    refute events.any? { |e| e[:uri].include?('SECRET') }
  end

  def test_api_assertion_helpers
    transport = ->(**_) { { status: 200, headers: { 'x-test' => 'yes' }, body: '{"user":{"id":123},"items":[{"sku":"A1"}]}' } }
    r = SdetFlow::ApiClient.new(base_url: 'https://example.test', transport: transport).get('/x')
    r.expect_status_2xx.expect_header('x-test','yes').expect_body_contains('user').expect_json_path('$.user.id',123).expect_json_path('items[0].sku','A1')
  end

  def test_idempotency_key_enables_post_retry
    calls = 0
    transport = ->(**_) { calls += 1; { status: calls < 2 ? 503 : 200, headers: {}, body: 'ok' } }
    config = SdetFlow::Config.new(retry_max_attempts: 2, retry_base_delay: 0, retry_max_delay: 0)
    client = SdetFlow::ApiClient.new(base_url: 'https://example.test', config: config, transport: transport)
    assert_equal 200, client.post('/orders', json: {a:1}, idempotency_key: 'key-1').status
    assert_equal 2, calls
  end

  def test_redactor_masks_jwt_and_openai_style_key
    text = SdetFlow::Redactor.redact('token eyJabc.def.ghi sk-abcdefghijklmnopqrstuvwxyz123456')
    refute_includes text, 'eyJabc'
    refute_includes text, 'sk-abc'
  end

  class FakeWeb
    attr_reader :actions
    def initialize
      @actions = []
    end
    def locate(candidate)
      raise 'not found password=secret' if candidate == :bad
      candidate
    end
    def click(locator)
      @actions << [:click, locator]
    end
    def fill(locator, value)
      @actions << [:fill, locator, value]
    end
  end

  def test_web_actions_fall_back
    adapter = FakeWeb.new
    out = SdetFlow::Web::Actions.new(adapter: adapter).click([:bad, :good])
    assert_equal :good, out[:candidate]
    refute_includes out[:errors].first[:error], 'secret'
  end
end
