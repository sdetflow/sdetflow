package io.sdetflow.api;
import java.net.URI;import java.net.http.HttpRequest;import java.nio.charset.StandardCharsets;import java.util.Base64;
@FunctionalInterface public interface AuthStrategy { URI apply(HttpRequest.Builder builder,URI uri);
 static AuthStrategy none(){return(b,u)->u;} static AuthStrategy bearer(String token){if(token==null||token.isBlank())throw new IllegalArgumentException("bearer token is required");return(b,u)->{b.header("Authorization","Bearer "+token);return u;};}
 static AuthStrategy basic(String user,String password){if(user==null||password==null)throw new IllegalArgumentException("basic credentials required");String x=Base64.getEncoder().encodeToString((user+":"+password).getBytes(StandardCharsets.UTF_8));return(b,u)->{b.header("Authorization","Basic "+x);return u;};}
 static AuthStrategy apiKeyHeader(String header,String value){if(header==null||header.isBlank()||value==null||value.isBlank())throw new IllegalArgumentException("API key header/value required");return(b,u)->{b.header(header,value);return u;};}
 static AuthStrategy apiKeyQuery(String name,String value){if(name==null||name.isBlank()||value==null||value.isBlank())throw new IllegalArgumentException("API key query name/value required");return(b,u)->{String sep=u.getQuery()==null?"?":"&";return URI.create(u+sep+SdetFlowApiClient.urlEncode(name)+"="+SdetFlowApiClient.urlEncode(value));};}
}
