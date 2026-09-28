package io.sdetflow.api;

import java.net.http.HttpHeaders;
import java.util.Objects;

public record ApiResponse(int statusCode, HttpHeaders headers, String body, long durationMs) {
    public ApiResponse expectStatus(int expected) { if(statusCode!=expected)throw new AssertionError("Expected HTTP "+expected+" but received "+statusCode+". Body: "+Redactor.redact(body)); return this; }
    public ApiResponse expectStatus2xx(){if(statusCode<200||statusCode>=300)throw new AssertionError("Expected 2xx but received "+statusCode+". Body: "+Redactor.redact(body));return this;}
    public ApiResponse expectBodyContains(String expected){if(expected==null)throw new IllegalArgumentException("expected text must not be null");if(body==null||!body.contains(expected))throw new AssertionError("Response body did not contain expected text: "+Redactor.redact(expected));return this;}
    public ApiResponse expectHeader(String name,String expected){String actual=headers.firstValue(name).orElse(null);if(!Objects.equals(actual,expected))throw new AssertionError("Expected header "+name+"="+Redactor.redact(expected)+" but was "+Redactor.redact(actual));return this;}
    public ApiResponse expectDurationBelow(long maxMs){if(maxMs<0)throw new IllegalArgumentException("maxMs must be >= 0");if(durationMs>maxMs)throw new AssertionError("Expected response duration <= "+maxMs+"ms but was "+durationMs+"ms");return this;}
    public Object json(){return Json.parse(body);}
    public ApiResponse expectJsonPath(String path,Object expected){Object actual=Json.path(json(),path);if(!Objects.equals(normalizeNumber(actual),normalizeNumber(expected)))throw new AssertionError("Expected JSON path "+path+" to equal "+Redactor.redact(String.valueOf(expected))+" but was "+Redactor.redact(String.valueOf(actual)));return this;}
    public ApiResponse expectSchema(JsonSchema schema){var errors=schema.validate(json());if(!errors.isEmpty())throw new AssertionError("JSON schema validation failed: "+String.join("; ",errors));return this;}
    private static Object normalizeNumber(Object v){if(v instanceof Number n)return n.doubleValue();return v;}
}
