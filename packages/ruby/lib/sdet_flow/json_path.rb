module SdetFlow
  module JsonPath
    module_function
    def get(root, path)
      return root if path.nil? || path.to_s.empty? || path.to_s == '$'
      tokens = path.to_s.sub(/^\$\.?/, '').scan(/[^.\[\]]+|\[(\d+)\]/).flatten.compact
      # scan above loses plain tokens with capture behavior in Ruby; use explicit parser
      tokens = path.to_s.sub(/^\$\.?/, '').gsub(/\[(\d+)\]/, '.\\1').split('.').reject(&:empty?)
      tokens.reduce(root) do |current, token|
        if current.is_a?(Hash)
          current[token] || current[token.to_sym]
        elsif current.is_a?(Array) && token.match?(/^\d+$/)
          current[token.to_i]
        else
          nil
        end
      end
    end
  end
end
