/**
 * Byte formatting, split out of lib/uploads.ts because that module is
 * `server-only` (it touches the filesystem) and the chat UI needs to render
 * file sizes on the client.
 */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}
