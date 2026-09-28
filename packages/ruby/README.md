# sdet_flow

Reusable Ruby quality-engineering primitives by **Sumanth Gumedelli**: API automation, retries, redaction, JSON assertions, and framework adapters designed to complement RSpec/Cucumber, Capybara, Watir, and Selenium-based test suites.

## Install

```ruby
gem 'sdet_flow', '~> 0.2'
```

## API example

```ruby
client = SdetFlow::ApiClient.new(
  base_url: 'https://api.example.com',
  bearer_token: ENV.fetch('API_TOKEN')
)

client.get('/users/123')
  .expect_status_2xx
  .expect_json_path('$.user.id', 123)
```

POST requests are not retried automatically. Supply `idempotency_key:` or `idempotent: true` only when retrying is safe.

## Web adapters

`SdetFlow::Web::Actions` accepts deterministic locator candidates. Optional `SdetFlow::Adapters::Capybara` and `SdetFlow::Adapters::Watir` adapters use duck typing and do not force those gems as runtime dependencies.

## Security

Telemetry redacts common bearer/password/API-key/JWT/provider-key patterns. Keep credentials in environment or CI secret stores, never source control.

## License

Apache-2.0
