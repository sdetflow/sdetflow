package io.sdetflow.api;

public record RequestEvent(
    String type,
    String method,
    String uri,
    int attempt,
    Integer status,
    Long durationMs,
    String message
) {}
