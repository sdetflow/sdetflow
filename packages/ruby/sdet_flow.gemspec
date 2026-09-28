require_relative 'lib/sdet_flow/version'

Gem::Specification.new do |spec|
  spec.name = 'sdet_flow'
  spec.version = SdetFlow::VERSION
  spec.authors = ['Sumanth Gumedelli']
  spec.email = ['sumantthh@gmail.com']
  spec.summary = 'Reusable Ruby quality-engineering primitives from SDETFlow.'
  spec.description = 'Ruby automation utilities for API testing, retries, redaction, web adapter fallbacks, and integration with GenAI-powered quality engineering tools.'
  spec.homepage = 'https://github.com/sdetflow/sdetflow'
  spec.license = 'Apache-2.0'
  spec.required_ruby_version = '>= 3.1'
  spec.files = Dir['lib/**/*.rb', 'README.md', 'LICENSE']
  spec.require_paths = ['lib']
  spec.metadata = {
    'source_code_uri' => 'https://github.com/sdetflow/sdetflow/tree/main/packages/ruby',
    'documentation_uri' => 'https://github.com/sdetflow/sdetflow/tree/main/packages/ruby#readme',
    'bug_tracker_uri' => 'https://github.com/sdetflow/sdetflow/issues',
    'changelog_uri' => 'https://github.com/sdetflow/sdetflow/releases',
    'rubygems_mfa_required' => 'true'
  }
end
