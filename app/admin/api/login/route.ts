import { NextRequest, NextResponse } from "next/server";
import { checkPassword, cookieOptions, createSession, csrfCookie, csrfSignature, isAdminNetwork, issueCsrf, sameOrigin, sessionCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  if (!isAdminNetwork(request)) return new Response(null, { status: 404 });
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string" || !checkPassword(body.password)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const session = await createSession();
  const csrf = issueCsrf();
  const response = NextResponse.json({ csrf });
  response.cookies.set(sessionCookie, session, cookieOptions);
  response.cookies.set(csrfCookie, csrf, cookieOptions);
  response.cookies.set("blog_admin_csrf_sig", csrfSignature(session, csrf), cookieOptions);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
