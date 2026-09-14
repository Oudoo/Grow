import "dotenv/config";
export declare const env: {
    readonly nodeEnv: string;
    readonly appUrl: string;
    readonly databaseUrl: string;
    readonly redisUrl: string;
    readonly authSecret: string;
    /** 32-byte hex key for AES-256-GCM credential encryption at rest */
    readonly credentialEncryptionKey: string;
    readonly anthropicApiKey: string;
    readonly openaiApiKey: string;
    /** Gemini API key from AI Studio (paid tier — the Developer Program credit funds it). */
    readonly geminiApiKey: string;
    /** anthropic | gemini | openai */
    readonly aiPrimaryProvider: string;
    /** gemini-2.5-pro by default; gemini-3.8-flash / gemini-2.5-flash are the cheaper choices. */
    readonly geminiModel: string;
    /** 1536-dimensional, to match the vectors the AOM already stores. */
    readonly geminiEmbeddingModel: string;
    /** claude-opus-5 by default; ANTHROPIC_MODEL=claude-sonnet-5 is the cheaper choice. */
    readonly anthropicModel: string;
    readonly openaiModel: string;
    readonly embeddingModel: string;
    readonly vexaApiUrl: string;
    readonly vexaApiKey: string;
    /** Shared secret Vexa signs webhook deliveries with (PUT /user/webhook). */
    readonly vexaWebhookSecret: string;
    /** The name the bot joins the call under, and what people say to address it. */
    readonly mayaBotName: string;
    /** ISO language for transcription; empty = Vexa auto-detects each window. */
    readonly mayaLanguage: string;
    /** Path to a whisper.cpp `main`/`whisper-cli` binary for local transcription */
    readonly whisperCppPath: string;
    readonly whisperCppModelPath: string;
    readonly storageEndpoint: string;
    readonly storagePort: number;
    readonly storageUseSsl: boolean;
    readonly storageAccessKey: string;
    readonly storageSecretKey: string;
    readonly storageBucket: string;
    readonly smtpHost: string;
    readonly smtpPort: number;
    readonly smtpUser: string;
    readonly smtpPassword: string;
    readonly smtpFrom: string;
    readonly glitchtipDsn: string;
    readonly otelExporterEndpoint: string;
    readonly metaAppId: string;
    readonly metaAppSecret: string;
    readonly googleClientId: string;
    readonly googleClientSecret: string;
    /** GA4 service account JSON (base64-encoded) for server-to-server access */
    readonly ga4ServiceAccountJson: string;
    readonly googleAdsDeveloperToken: string;
    readonly tiktokAppId: string;
    readonly tiktokAppSecret: string;
    readonly linkedinClientId: string;
    readonly linkedinClientSecret: string;
    readonly xApiKey: string;
    readonly xApiSecret: string;
    readonly slackWebhookUrl: string;
    readonly teamsWebhookUrl: string;
    readonly scraperApiKey: string;
    readonly wikiJsUrl: string;
};
export declare const isProduction: boolean;
//# sourceMappingURL=env.d.ts.map