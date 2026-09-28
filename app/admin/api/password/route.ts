import { NextRequest, NextResponse } from "next/server";
import { authenticated, isAdminNetwork, sameOrigin, verifyCsrf, sessionCookie, csrfCookie, cookieOptions } from "@/lib/admin-auth";
import { changePassword } from "@/lib/credentials";

export async function POST(request: NextRequest) {
  if (!isAdminNetwork(request) || !await authenticated(request)) return new Response(null, { status: 401 });
  if (!sameOrigin(request) || !verifyCsrf(request)) return new Response(null, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.current !== "string" || typeof body.next !== "string") return Response.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
  try { changePassword(body.current, body.next); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "변경 실패" }, { status: 400 }); }
  const response = NextResponse.json({ ok: true });
  for (const name of [sessionCookie, csrfCookie, "blog_admin_csrf_sig"]) response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
