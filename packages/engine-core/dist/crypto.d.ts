/**
 * Encrypts integration credentials / webhook secrets at rest.
 * Output format: base64(iv).base64(tag).base64(ciphertext)
 */
export declare function encryptSecret(plaintext: string): string;
export declare function decryptSecret(payload: string): string;
export declare function encryptJson(value: unknown): string;
export declare function decryptJson<T = Record<string, unknown>>(payload: string): T;
/** SHA-256 hash used for API key storage (keys are never stored raw). */
export declare function sha256(value: string): string;
export declare function generateApiKey(): {
    raw: string;
    hash: string;
    prefix: string;
};
export declare function generateToken(bytes?: number): string;
//# sourceMappingURL=crypto.d.ts.map