package io.sdetflow.api;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ApiRequest {
    final String method; final String path; final Map<String,String> headers=new LinkedHashMap<>(); final Map<String,String> query=new LinkedHashMap<>(); String body; boolean idempotent;
    ApiRequest(String method,String path){if(path==null||path.isBlank())throw new IllegalArgumentException("path is required");this.method=method;this.path=path;this.idempotent=switch(method){case"GET","HEAD","OPTIONS","PUT","DELETE"->true;default->false;};}
    public ApiRequest header(String name,String value){if(name==null||name.isBlank())throw new IllegalArgumentException("header name is required");headers.put(name,value);return this;}
    public ApiRequest query(String name,String value){if(name==null||name.isBlank())throw new IllegalArgumentException("query name is required");query.put(name,value);return this;}
    public ApiRequest json(String json){this.body=json;headers.putIfAbsent("Content-Type","application/json");return this;}
    public ApiRequest body(String value,String contentType){this.body=value;if(contentType!=null)headers.put("Content-Type",contentType);return this;}
    public ApiRequest idempotent(boolean value){this.idempotent=value;return this;}
    public ApiRequest idempotencyKey(String value){header("Idempotency-Key",value);this.idempotent=true;return this;}
}
