export class ConnectorError extends Error {
    provider;
    retryable;
    requestId;
    constructor(provider, message, retryable = true, requestId = null) {
        super(`[${provider}] ${message}`);
        this.provider = provider;
        this.retryable = retryable;
        this.requestId = requestId;
        this.name = "ConnectorError";
    }
}
//# sourceMappingURL=types.js.map