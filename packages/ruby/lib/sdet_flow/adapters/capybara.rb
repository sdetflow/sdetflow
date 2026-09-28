module SdetFlow; module Adapters
  class Capybara
    def initialize(session);@session=session;end
    def locate(candidate);type=(candidate[:type]||:css).to_sym;value=candidate.fetch(:value);case type;when :css then @session.find(value);when :text then @session.find('*',text:value);when :test_id then @session.find(%([data-testid="#{value}"]));else raise ArgumentError,"unsupported Capybara locator type: #{type}";end;end
    def click(locator);locator.click;end
    def fill(locator,value);locator.set(value);end
  end
end; end
