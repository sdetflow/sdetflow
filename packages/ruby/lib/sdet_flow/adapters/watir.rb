module SdetFlow; module Adapters
  class Watir
    def initialize(browser);@browser=browser;end
    def locate(candidate);type=(candidate[:type]||:css).to_sym;value=candidate.fetch(:value);case type;when :css then @browser.element(css:value);when :id then @browser.element(id:value);when :text then @browser.element(text:value);when :test_id then @browser.element(data_testid:value);else raise ArgumentError,"unsupported Watir locator type: #{type}";end;end
    def click(locator);locator.click;end
    def fill(locator,value);locator.set(value);end
  end
end; end
