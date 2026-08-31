import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File storage for chat attachments.
 *
 * **Where files go, and why it matters.** A deploy replaces the application
 * directory wholesale — that is how this host works, and it is why `.grow.env`
 * lives outside it. Anything written inside the app directory is destroyed on
 * the next release. Uploads therefore go to a sibling directory, resolved from
 * UPLOAD_DIR or defaulting to `<app>/../../uploads`, which on this host lands at
 * `<domain>/uploads` — next to the deploy, not inside it.
 *
 * **Security posture.** User input never reaches a filesystem path: the stored
 * name is a generated id plus an extension derived from the validated MIME type.
 * The original filename is kept in the database for display only. Types are an
 * allow-list, not a block-list, and the served response always carries
 * Content-Disposition so nothing is rendered inline as active content.
 */

/** Allowed types, mapped to the extension used on disk. */
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/zip": "zip",
};

/** 10 MB. Shared hosting has a real disk quota; this is not the place to spend it. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function isAllowedType(mime: string): boolean {
  return Object.prototype.hasOwnProperty.call(ALLOWED, mime);
}

export function allowedTypeList(): string[] {
  return Object.keys(ALLOWED);
}

function uploadDir(): string {
  const configured = process.env.UPLOAD_DIR;
  // cwd is the app directory (server.js chdirs there); two levels up is the
  // domain root on this host, alongside the deploy rather than inside it.
  const dir = configured || path.join(process.cwd(), "..", "..", "uploads");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o750 });
  return dir;
}

export interface StoredFile {
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
  fileName: string;
}

export interface StoreResult {
  ok: boolean;
  file?: StoredFile;
  error?: string;
}

/**
 * Write an uploaded file to disk. Returns a message for the user on rejection
 * rather than throwing, so the form can show it.
 */
export async function storeUpload(file: File): Promise<StoreResult> {
  if (!file || file.size === 0) return { ok: false, error: "That file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `That file is ${(file.size / 1_048_576).toFixed(1)} MB — the limit is ${MAX_UPLOAD_BYTES / 1_048_576} MB.`,
    };
  }
  if (!isAllowedType(file.type)) {
    return {
      ok: false,
      error: `${file.type || "That file type"} is not accepted. Images, PDFs, Office documents, text, CSV and ZIP are.`,
    };
  }

  const ext = ALLOWED[file.type];
  // Generated name only — the uploaded filename never touches the path, so
  // "../../server.js" is not a filename, it is just a label in the database.
  const storageKey = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(path.join(uploadDir(), storageKey), bytes, { mode: 0o640 });
  } catch (e) {
    console.error("[uploads] write failed:", e);
    return { ok: false, error: "Could not save that file. Try again." };
  }

  return {
    ok: true,
    file: {
      storageKey,
      sizeBytes: file.size,
      mimeType: file.type,
      // Trimmed for display; path separators stripped so a crafted name cannot
      // mislead someone reading it.
      fileName: file.name.replace(/[/\\]/g, "_").slice(0, 180) || `file.${ext}`,
    },
  };
}

/** Read a stored file back. Rejects anything that is not a bare generated key. */
export async function readUpload(storageKey: string): Promise<Buffer | null> {
  // Defence in depth: the key comes from our own database, but validating the
  // shape means a corrupted row still cannot escape the upload directory.
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/i.test(storageKey)) return null;
  try {
    return await readFile(path.join(uploadDir(), storageKey));
  } catch {
    return null;
  }
}

export async function deleteUpload(storageKey: string): Promise<void> {
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/i.test(storageKey)) return;
  try {
    await unlink(path.join(uploadDir(), storageKey));
  } catch {
    // Already gone is the desired end state.
  }
}

/** Weak ETag for caching an immutable attachment. */
export function uploadETag(storageKey: string, sizeBytes: number): string {
  return `"${createHash("sha1").update(`${storageKey}:${sizeBytes}`).digest("hex").slice(0, 16)}"`;
}

export { formatBytes } from "./upload-format";
