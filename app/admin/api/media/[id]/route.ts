import { NextRequest } from "next/server";
import { authenticated, isAdminNetwork, sameOrigin, verifyCsrf } from "@/lib/admin-auth";
import { removeMedia, MediaError } from "@/lib/media";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminNetwork(request) || !await authenticated(request)) return new Response(null, { status: 401 });
  if (!sameOrigin(request) || !verifyCsrf(request)) return new Response(null, { status: 403 });
  try {
    removeMedia((await context.params).id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof MediaError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "파일 삭제에 실패했습니다." }, { status: 500 });
  }
}
