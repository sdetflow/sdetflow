package io.sdetflow.api;

public record RetryPolicy(int maxAttempts, long baseDelayMs, long maxDelayMs, double factor) {
    public RetryPolicy {
        if (maxAttempts < 1) throw new IllegalArgumentException("maxAttempts must be >= 1");
        if (baseDelayMs < 0 || maxDelayMs < baseDelayMs) throw new IllegalArgumentException("invalid retry delays");
        if (factor < 1.0) throw new IllegalArgumentException("factor must be >= 1");
    }

    public static RetryPolicy defaults() {
        return new RetryPolicy(3, 200, 2_000, 2.0);
    }

    public long delayForAttempt(int attempt) {
        double raw = baseDelayMs * Math.pow(factor, Math.max(0, attempt - 1));
        return Math.min(maxDelayMs, Math.round(raw));
    }
}
