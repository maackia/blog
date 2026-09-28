import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { authenticated, isAdminNetwork, sameOrigin, verifyCsrf } from "@/lib/admin-auth";
import { deletePost, findPost, savePost } from "@/lib/store";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ slug: string }> };
async function allow(request: NextRequest) {
  return isAdminNetwork(request) && await authenticated(request) && sameOrigin(request) && verifyCsrf(request);
}
export async function PUT(request: NextRequest, context: Context) {
  if (!await allow(request)) return new Response(null, { status: 403 });
  const { slug } = await context.params;
  if (!findPost(slug, true)) return new Response(null, { status: 404 });
  try {
    return Response.json(savePost(await request.json(), slug));
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "Invalid post fields" }, { status: 400 });
    if (error instanceof Error && error.message === "SLUG_TAKEN") return Response.json({ error: "Slug already exists" }, { status: 409 });
    if (error instanceof Error && /MDX|URL|JavaScript|Callout/.test(error.message)) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
export async function DELETE(request: NextRequest, context: Context) {
  if (!await allow(request)) return new Response(null, { status: 403 });
  const { slug } = await context.params;
  if (!deletePost(slug)) return new Response(null, { status: 404 });
  return new Response(null, { status: 204 });
}
