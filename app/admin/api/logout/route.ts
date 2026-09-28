import { NextRequest, NextResponse } from "next/server";
import { authenticated, csrfCookie, isAdminNetwork, sameOrigin, sessionCookie, verifyCsrf } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!isAdminNetwork(request)) return new Response(null, { status: 404 });
  if (!await authenticated(request)) return new Response(null, { status: 401 });
  if (!sameOrigin(request) || !verifyCsrf(request)) return new Response(null, { status: 403 });
  const response = NextResponse.json({ ok: true });
  for (const name of [sessionCookie, csrfCookie, "blog_admin_csrf_sig"]) response.cookies.delete(name);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
