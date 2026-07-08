import { Client as MinioClient } from "minio";
export declare function storage(): MinioClient;
export declare function ensureBucket(): Promise<void>;
export declare function uploadObject(key: string, data: Buffer, contentType: string): Promise<string>;
export declare function downloadObject(key: string): Promise<Buffer>;
/** Time-limited download URL for the portals. */
export declare function presignedUrl(key: string, expirySeconds?: number): Promise<string>;
export declare function deleteObject(key: string): Promise<void>;
//# sourceMappingURL=storage.d.ts.map