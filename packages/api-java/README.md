# sdetflow-api

A Java 17+ API automation SDK from **SDETFlow** for reusable enterprise API testing. It uses the JDK HTTP client and has no runtime dependencies in its core JAR.

## Maven coordinates

```xml
<dependency>
  <groupId>io.sdetflow</groupId>
  <artifactId>sdetflow-api</artifactId>
  <version>0.2.0</version>
</dependency>
```

Coordinates become installable from Maven Central after registry publication.

## Example

```java
var client = SdetFlowApiClient.builder("https://api.example.com")
    .auth(AuthStrategy.bearer(System.getenv("API_TOKEN")))
    .retryPolicy(new RetryPolicy(3, 200, 2_000, 2.0))
    .build();

var schema = new JsonSchema()
    .require("user.id", JsonSchema.Type.NUMBER)
    .require("user.name", JsonSchema.Type.STRING);

client.execute(client.get("/users/123"))
    .expectStatus2xx()
    .expectJsonPath("$.user.id", 123)
    .expectSchema(schema)
    .expectDurationBelow(2_000);
```

## Capabilities

- GET/POST/PUT/PATCH/DELETE request builders;
- bearer, basic, header API-key, and query API-key authentication;
- default headers and correlation-ID generation;
- safe retries: idempotent methods only unless explicitly opted in or an idempotency key is supplied;
- `Retry-After` support for retryable responses;
- fluent status/header/body/duration assertions;
- dependency-free JSON parser, JSON-path lookup, and lightweight schema checks;
- redacted request telemetry;
- Java 17 bytecode and automatic module name `io.sdetflow.api`.

## License

Apache-2.0
