import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { env } from "./env.js";
const ALGO = "aes-256-gcm";
function key() {
    return Buffer.from(env.credentialEncryptionKey, "hex");
}
/**
 * Encrypts integration credentials / webhook secrets at rest.
 * Output format: base64(iv).base64(tag).base64(ciphertext)
 */
export function encryptSecret(plaintext) {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGO, key(), iv);
    const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}
export function decryptSecret(payload) {
    const [ivB64, tagB64, dataB64] = payload.split(".");
    if (!ivB64 || !tagB64 || !dataB64)
        throw new Error("Malformed encrypted payload");
    const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
        decipher.update(Buffer.from(dataB64, "base64")),
        decipher.final(),
    ]).toString("utf8");
}
export function encryptJson(value) {
    return encryptSecret(JSON.stringify(value));
}
export function decryptJson(payload) {
    return JSON.parse(decryptSecret(payload));
}
/** SHA-256 hash used for API key storage (keys are never stored raw). */
export function sha256(value) {
    return createHash("sha256").update(value).digest("hex");
}
export function generateApiKey() {
    const raw = `ge_${randomBytes(24).toString("base64url")}`;
    return { raw, hash: sha256(raw), prefix: raw.slice(0, 11) };
}
export function generateToken(bytes = 32) {
    return randomBytes(bytes).toString("base64url");
}
//# sourceMappingURL=crypto.js.map