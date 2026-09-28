require 'net/http'; require 'uri'; require 'json'; require 'base64'; require 'timeout'; require_relative 'json_path'
module SdetFlow
  class ApiResponse
    attr_reader :status,:headers,:body,:duration_ms
    def initialize(status:,headers:,body:,duration_ms:);@status=status.to_i;@headers=headers.freeze;@body=body.to_s;@duration_ms=duration_ms;freeze;end
    def expect_status(expected);raise "Expected HTTP #{expected}, got #{@status}. Body: #{Redactor.redact(@body)}" unless @status==expected.to_i;self;end
    def expect_status_2xx;raise "Expected 2xx, got #{@status}. Body: #{Redactor.redact(@body)}" unless (200...300).cover?(@status);self;end
    def expect_body_contains(value);raise "Expected response body to contain #{Redactor.redact(value.to_s)}" unless @body.include?(value.to_s);self;end
    def expect_header(name,value);actual=@headers[name.to_s.downcase]||@headers[name.to_s];raise "Expected header #{name}=#{Redactor.redact(value.to_s)}, got #{Redactor.redact(actual.to_s)}" unless actual.to_s==value.to_s;self;end
    def expect_duration_below(ms);raise "Expected duration <= #{ms}ms, got #{@duration_ms}ms" if @duration_ms>ms.to_i;self;end
    def json;JSON.parse(@body);end
    def expect_json_path(path,expected);actual=JsonPath.get(json,path);raise "Expected JSON path #{path}=#{Redactor.redact(expected.inspect)}, got #{Redactor.redact(actual.inspect)}" unless actual==expected;self;end
  end

  class ApiClient
    IDEMPOTENT=%i[get head options put delete].freeze; RETRYABLE_STATUSES=[408,425,429].freeze
    def initialize(base_url:,config:Config.new,headers:{},bearer_token:nil,basic_auth:nil,api_key:nil,event_sink:nil,transport:nil,correlation_id:nil)
      @base=URI(base_url.end_with?('/')?base_url:"#{base_url}/");raise ArgumentError,'base_url must be absolute HTTP(S)' unless %w[http https].include?(@base.scheme)&&@base.host
      @config=config;@headers={'Accept'=>'application/json','User-Agent'=>"sdet_flow/#{SdetFlow::VERSION}"}.merge(headers.transform_keys(&:to_s)).freeze;@bearer_token=bearer_token;@basic_auth=basic_auth;@api_key=api_key;@event_sink=event_sink;@transport=transport;@correlation_id=correlation_id
    end
    def get(path,**opts)=request(:get,path,**opts);def post(path,**opts)=request(:post,path,**opts);def put(path,**opts)=request(:put,path,**opts);def patch(path,**opts)=request(:patch,path,**opts);def delete(path,**opts)=request(:delete,path,**opts)
    def request(method,path,query:{},headers:{},json:nil,body:nil,idempotent:nil,idempotency_key:nil)
      safe=idempotent.nil? ? IDEMPOTENT.include?(method.to_sym) : !!idempotent;safe=true if idempotency_key;max=safe ? @config.retry_max_attempts : 1;uri=build_uri(path,query)
      Retry.call(max_attempts:max,base_delay:@config.retry_base_delay,max_delay:@config.retry_max_delay,retry_if:->(e,_){transport_retryable?(e)},on_retry:->(i){emit(type:'retry',method:method,uri:uri,attempt:i[:attempt],message:i[:error].message)}) do |attempt|
        started=Process.clock_gettime(Process::CLOCK_MONOTONIC);emit(type:'attempt',method:method,uri:uri,attempt:attempt);h=headers.dup;h['Idempotency-Key']=idempotency_key if idempotency_key;response=perform(method,uri,headers:h,json:json,body:body);duration=((Process.clock_gettime(Process::CLOCK_MONOTONIC)-started)*1000).round;result=ApiResponse.new(status:response[:status],headers:normalize_headers(response[:headers]),body:response[:body],duration_ms:duration);emit(type:'response',method:method,uri:uri,attempt:attempt,status:result.status,duration_ms:duration);raise RetryableHttpError,"HTTP #{result.status}" if safe&&retryable_status?(result.status)&&attempt<max;result
      end
    end
    private
    class RetryableHttpError<StandardError;end
    def retryable_status?(s)=RETRYABLE_STATUSES.include?(s)||s>=500
    def transport_retryable?(e)=e.is_a?(RetryableHttpError)||e.is_a?(IOError)||e.is_a?(Timeout::Error)||e.is_a?(SocketError)
    def build_uri(path,query);uri=URI.join(@base.to_s,path.sub(%r{\A/},''));pairs=URI.decode_www_form(uri.query.to_s)+query.map{|k,v|[k.to_s,v.to_s]};uri.query=URI.encode_www_form(pairs) unless pairs.empty?;uri;end
    def perform(method,uri,headers:,json:,body:)
      h=safe_headers(headers);h['X-Correlation-Id']=@correlation_id.call if @correlation_id.respond_to?(:call);h['Authorization']="Bearer #{@bearer_token}" if @bearer_token;h['Authorization']="Basic #{Base64.strict_encode64(@basic_auth.join(':'))}" if @basic_auth;h[@api_key.fetch(:header).to_s]=@api_key.fetch(:value).to_s if @api_key
      return @transport.call(method:method,uri:uri,headers:h,json:json,body:body) if @transport
      klass={get:Net::HTTP::Get,post:Net::HTTP::Post,put:Net::HTTP::Put,patch:Net::HTTP::Patch,delete:Net::HTTP::Delete,head:Net::HTTP::Head,options:Net::HTTP::Options}.fetch(method.to_sym);req=klass.new(uri);h.each{|k,v|req[k]=v};if json;req['Content-Type']||='application/json';req.body=JSON.generate(json);elsif body;req.body=body;end;http=Net::HTTP.new(uri.host,uri.port);http.use_ssl=uri.scheme=='https';http.open_timeout=@config.request_timeout;http.read_timeout=@config.request_timeout;res=http.request(req);{status:res.code.to_i,headers:res.each_header.to_h,body:res.body.to_s}
    end
    def safe_headers(extra)=@headers.merge(extra.transform_keys(&:to_s));def normalize_headers(h)=h.to_h.transform_keys{|k|k.to_s.downcase}
    def emit(type:,method:,uri:,attempt:,status:nil,duration_ms:nil,message:nil);return unless @event_sink;@event_sink.call({type:type,method:method.to_s.upcase,uri:Redactor.redact(uri.to_s),attempt:attempt,status:status,duration_ms:duration_ms,message:Redactor.redact(message)}.compact);rescue StandardError;nil;end
  end
end
