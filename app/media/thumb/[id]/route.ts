import fs from "node:fs/promises";
import path from "node:path";
import { findMedia, mediaDirectory } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Editor grid previews only. The article and the media URL always use the full image.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const match = /^([a-f0-9-]{36})\.webp$/.exec(id);
  if (!match) return new Response(null, { status: 404 });
  const item = findMedia(match[1]);
  if (!item || !item.thumb_bytes) return new Response(null, { status: 404 });
  try {
    const buffer = await fs.readFile(path.join(mediaDirectory(), `${item.id}-thumb.webp`));
    return new Response(new Uint8Array(buffer), { headers: {
      "Content-Type": "image/webp", "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="${item.id}-thumb.webp"`,
    } });
  } catch { return new Response(null, { status: 404 }); }
}
