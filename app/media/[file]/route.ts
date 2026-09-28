import fs from "node:fs/promises";
import path from "node:path";
import { findMedia, mediaDirectory } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const match = /^([a-f0-9-]{36})\.webp$/.exec(file);
  if (!match || !findMedia(match[1])) return new Response(null, { status: 404 });
  try {
    const buffer = await fs.readFile(path.join(mediaDirectory(), file));
    return new Response(new Uint8Array(buffer), { headers: {
      "Content-Type": "image/webp", "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="${file}"`,
    } });
  } catch { return new Response(null, { status: 404 }); }
}
