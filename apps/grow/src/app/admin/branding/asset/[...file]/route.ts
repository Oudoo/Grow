import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assertAccess } from "@/lib/auth";

/**
 * Serves the Living Brand System's static assets behind the IAM. Staff-only:
 * requires `branding` view access (middleware also gates /admin/*). A strict
 * allow-list prevents path traversal. These files used to live in public/branding
 * and were world-readable; they are now private to the Branding tab.
 */
const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const ALLOWED = new Set([
  "index.html",
  "sample-unbranded.html",
  "app.js",
  "style.css",
  "grow-mark.svg",
  "logo.jpg",
]);

const ASSET_DIR = path.join(process.cwd(), "src/app/admin/branding/_assets");

export async function GET(_req: Request, { params }: { params: Promise<{ file: string[] }> }) {
  try {
    await assertAccess("branding", "view");
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { file } = await params;
  const name = (file ?? []).join("/");
  if (!ALLOWED.has(name)) return new NextResponse("Not found", { status: 404 });

  try {
    const buf = await readFile(path.join(ASSET_DIR, name));
    return new NextResponse(buf, {
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(name)] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
