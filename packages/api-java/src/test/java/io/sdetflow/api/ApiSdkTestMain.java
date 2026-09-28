package io.sdetflow.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public final class ApiSdkTestMain {
    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        AtomicInteger unstable = new AtomicInteger();
        server.createContext("/ok", ex -> reply(ex, 200, "{\"status\":\"ok\"}"));
        server.createContext("/echo", ex -> reply(ex, 201, ex.getRequestMethod() + ":" + new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8)));
        server.createContext("/auth", ex -> reply(ex, "Bearer secret-token".equals(ex.getRequestHeaders().getFirst("Authorization")) ? 200 : 401, "auth"));
        server.createContext("/unstable", ex -> reply(ex, unstable.incrementAndGet() < 3 ? 503 : 200, "attempt=" + unstable.get()));
        server.createContext("/post-unstable", ex -> { unstable.incrementAndGet(); reply(ex, 503, "no retry"); });
        server.createContext("/headers", ex -> { ex.getResponseHeaders().add("X-Test", "yes"); reply(ex, 200, "{\"user\":{\"id\":123,\"active\":true},\"items\":[{\"sku\":\"A1\"}]}"); });
        server.start();

        String base = "http://127.0.0.1:" + server.getAddress().getPort();
        try {
            run("GET and fluent assertion", () -> {
                var client = SdetFlowApiClient.builder(base).build();
                client.execute(client.get("/ok")).expectStatus(200).expectBodyContains("ok");
            });
            run("POST JSON", () -> {
                var client = SdetFlowApiClient.builder(base).build();
                client.execute(client.post("/echo").json("{\"a\":1}")).expectStatus(201).expectBodyContains("POST:{\"a\":1}");
            });
            run("Bearer auth", () -> {
                var client = SdetFlowApiClient.builder(base).auth(AuthStrategy.bearer("secret-token")).build();
                client.execute(client.get("/auth")).expectStatus(200);
            });
            run("GET retries 503", () -> {
                unstable.set(0);
                var client = SdetFlowApiClient.builder(base).retryPolicy(new RetryPolicy(3, 0, 0, 1)).build();
                client.execute(client.get("/unstable")).expectStatus(200);
                check(unstable.get() == 3, "expected 3 attempts");
            });
            run("POST does not retry by default", () -> {
                unstable.set(0);
                var client = SdetFlowApiClient.builder(base).retryPolicy(new RetryPolicy(3, 0, 0, 1)).build();
                client.execute(client.post("/post-unstable").json("{}"));
                check(unstable.get() == 1, "unsafe POST should not retry");
            });
            run("POST can opt into idempotent retry", () -> {
                unstable.set(0);
                var client = SdetFlowApiClient.builder(base).retryPolicy(new RetryPolicy(2, 0, 0, 1)).build();
                client.execute(client.post("/post-unstable").idempotent(true).json("{}"));
                check(unstable.get() == 2, "idempotent POST should retry");
            });
            run("Redactor removes bearer and password", () -> {
                String redacted = Redactor.redact("Authorization: Bearer ABC password=hunter2");
                check(!redacted.contains("ABC") && !redacted.contains("hunter2"), "secrets leaked");
            });

            run("JSON path and schema assertions", () -> {
                var client = SdetFlowApiClient.builder(base).build();
                var schema = new JsonSchema().require("user.id", JsonSchema.Type.NUMBER).require("items", JsonSchema.Type.ARRAY);
                client.execute(client.get("/headers")).expectStatus2xx().expectHeader("X-Test", "yes").expectJsonPath("$.user.id", 123).expectJsonPath("items[0].sku", "A1").expectSchema(schema);
            });
            run("Basic auth factory builds safely", () -> {
                var strategy = AuthStrategy.basic("u", "p");
                check(strategy != null, "basic auth missing");
            });
            run("Invalid base URI rejected", () -> {
                boolean threw=false; try { SdetFlowApiClient.builder("ftp://example.com"); } catch (IllegalArgumentException e) { threw=true; }
                check(threw, "invalid scheme accepted");
            });
            run("Correlation id is emitted", () -> {
                final String[] seen = new String[1];
                server.createContext("/corr", ex -> { seen[0]=ex.getRequestHeaders().getFirst("X-Correlation-Id"); reply(ex,200,"ok"); });
                var client=SdetFlowApiClient.builder(base).correlationIdSupplier(() -> "corr-123").build();
                client.execute(client.get("/corr")).expectStatus(200);
                check("corr-123".equals(seen[0]), "missing correlation id");
            });
            run("Telemetry URI redaction", () -> {
                List<RequestEvent> events = new ArrayList<>();
                var client = SdetFlowApiClient.builder(base).onEvent(events::add).build();
                client.execute(client.get("/ok").query("api_key", "SECRET"));
                check(events.stream().noneMatch(e -> e.uri().contains("SECRET")), "query key leaked to event");
            });
        } finally {
            server.stop(0);
        }

        System.out.println("api-java tests: " + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }

    private static void reply(HttpExchange ex, int status, String body) throws java.io.IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.close();
    }

    private static void run(String name, Checked action) {
        try { action.run(); passed++; System.out.println("PASS: " + name); }
        catch (Throwable t) { failed++; System.err.println("FAIL: " + name + " -> " + t); }
    }

    private static void check(boolean condition, String message) { if (!condition) throw new AssertionError(message); }
    @FunctionalInterface interface Checked { void run() throws Exception; }
}
