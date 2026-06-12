/**
 * Upload safety helpers — bound the size and shape of user-supplied files
 * before they are read into memory (the parsers are markdown/text only).
 */

export const MAX_UPLOAD_BYTES = 1 * 1024 * 1024; // 1 MB — generous for .md CVs/blueprints

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Validate an uploaded File: must exist, be within the size cap, and (when an
 * allowed-extension list is given) carry an accepted extension. Returns the
 * decoded UTF-8 text.
 */
export async function readUploadedText(
  file: File | null,
  opts: { allowedExtensions?: string[] } = {}
): Promise<string> {
  if (!file) {
    throw new UploadError("No file provided");
  }
  if (typeof file.size === "number" && file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `File too large (max ${Math.round(MAX_UPLOAD_BYTES / 1024)} KB)`,
      413
    );
  }
  if (opts.allowedExtensions?.length) {
    const name = (file.name || "").toLowerCase();
    if (!opts.allowedExtensions.some((ext) => name.endsWith(ext))) {
      throw new UploadError(
        `Only ${opts.allowedExtensions.join(", ")} files are accepted`
      );
    }
  }

  // Guard against a misreported size header: cap the actual bytes read too.
  const buf = await file.arrayBuffer();
  if (buf.byteLength > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `File too large (max ${Math.round(MAX_UPLOAD_BYTES / 1024)} KB)`,
      413
    );
  }
  return new TextDecoder("utf-8").decode(buf);
}
