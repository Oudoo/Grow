import { Client as MinioClient } from "minio";
import { env } from "./env.js";
/**
 * Object storage — MinIO (self-hosted) or any S3-compatible service
 * (Hostinger Object Storage). Recordings, creative assets, showcase
 * videos, QBR decks and backups live here.
 */
let client = null;
export function storage() {
    client ??= new MinioClient({
        endPoint: env.storageEndpoint,
        port: env.storagePort,
        useSSL: env.storageUseSsl,
        accessKey: env.storageAccessKey,
        secretKey: env.storageSecretKey,
    });
    return client;
}
export async function ensureBucket() {
    const exists = await storage().bucketExists(env.storageBucket);
    if (!exists)
        await storage().makeBucket(env.storageBucket);
}
export async function uploadObject(key, data, contentType) {
    await ensureBucket();
    await storage().putObject(env.storageBucket, key, data, data.length, {
        "Content-Type": contentType,
    });
    return key;
}
export async function downloadObject(key) {
    const stream = await storage().getObject(env.storageBucket, key);
    const chunks = [];
    for await (const chunk of stream)
        chunks.push(chunk);
    return Buffer.concat(chunks);
}
/** Time-limited download URL for the portals. */
export async function presignedUrl(key, expirySeconds = 3600) {
    return storage().presignedGetObject(env.storageBucket, key, expirySeconds);
}
export async function deleteObject(key) {
    await storage().removeObject(env.storageBucket, key);
}
//# sourceMappingURL=storage.js.map