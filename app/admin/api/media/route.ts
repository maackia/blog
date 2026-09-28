import { NextRequest } from "next/server";
import { authenticated, isAdminNetwork, sameOrigin, verifyCsrf } from "@/lib/admin-auth";
import { listMedia, uploadMedia, MediaError, MAX_UPLOAD_BYTES } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!isAdminNetwork(request) || !await authenticated(request)) return new Response(null, { status: 401 });
  return Response.json(listMedia(), { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  if (!isAdminNetwork(request) || !await authenticated(request)) return new Response(null, { status: 401 });
  if (!sameOrigin(request) || !verifyCsrf(request)) return new Response(null, { status: 403 });
  // Binary body instead of multipart: enforce the limit during streaming, even without Content-Length.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES) return Response.json({ error: "사진은 장당 10MB 이하로 올려 주세요." }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  const chunks: Buffer[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_UPLOAD_BYTES) { await reader.cancel(); throw new MediaError("사진은 장당 10MB 이하로 올려 주세요.", 413); }
      chunks.push(Buffer.from(value));
    }
    const filename = decodeURIComponent(request.headers.get("x-file-name") ?? "photo");
    const item = await uploadMedia(Buffer.concat(chunks), filename);
    return Response.json(item, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof MediaError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "사진 업로드에 실패했습니다. 파일과 저장 공간을 확인해 주세요." }, { status: 500 });
  } finally { reader.releaseLock(); }
}
