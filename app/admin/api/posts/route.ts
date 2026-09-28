import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { MediaError } from "@/lib/media";
import { authenticated, isAdminNetwork, sameOrigin, verifyCsrf } from "@/lib/admin-auth";
import { listPosts, savePost } from "@/lib/store";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!isAdminNetwork(request)) return new Response(null, { status: 404 });
  if (!await authenticated(request)) return new Response(null, { status: 401 });
  return Response.json(listPosts(true), { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  if (!isAdminNetwork(request)) return new Response(null, { status: 404 });
  if (!await authenticated(request)) return new Response(null, { status: 401 });
  if (!sameOrigin(request) || !verifyCsrf(request)) return new Response(null, { status: 403 });
  try {
    const body = await request.json();
    return Response.json(savePost(body), { status: 201 });
  } catch (error) {
    if (error instanceof MediaError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof ZodError) return Response.json({ error: "Invalid post fields" }, { status: 400 });
    if (error instanceof Error && error.message === "SLUG_TAKEN") return Response.json({ error: "Slug already exists" }, { status: 409 });
    if (error instanceof Error && /MDX|URL|JavaScript|Callout/.test(error.message)) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
