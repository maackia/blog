import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const sessionCookie = "blog_admin_session";
export const csrfCookie = "blog_admin_csrf";
const sessionAge = 60 * 60 * 8;

function secret() {
  const value = process.env.BLOG_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("BLOG_SESSION_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}

export function checkPassword(input: string) {
  const stored = process.env.BLOG_ADMIN_PASSWORD_HASH ?? "";
  const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(stored);
  if (!match || input.length > 1024) return false;
  const calculated = scryptSync(input, Buffer.from(match[1], "hex"), 64);
  return timingSafeEqual(calculated, Buffer.from(match[2], "hex"));
}

export async function createSession() {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime(`${sessionAge}s`).sign(secret());
}

export async function validSession(token?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch { return false; }
}

export function issueCsrf() { return randomBytes(32).toString("hex"); }
export function verifyCsrf(request: NextRequest) {
  const token = request.headers.get("x-csrf-token") ?? "";
  const cookie = request.cookies.get(csrfCookie)?.value ?? "";
  if (!/^[a-f0-9]{64}$/.test(cookie) || token.length !== cookie.length ||
      !timingSafeEqual(Buffer.from(token), Buffer.from(cookie))) return false;
  const session = request.cookies.get(sessionCookie)?.value ?? "";
  const binding = createHmac("sha256", secret()).update(session).update(cookie).digest("hex");
  const provided = request.cookies.get("blog_admin_csrf_sig")?.value ?? "";
  return /^[a-f0-9]{64}$/.test(provided) && timingSafeEqual(Buffer.from(provided), Buffer.from(binding));
}
export function csrfSignature(session: string, token: string) {
  return createHmac("sha256", secret()).update(session).update(token).digest("hex");
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.host === request.headers.get("host") && (url.protocol === "http:" || url.protocol === "https:");
  } catch { return false; }
}

// Tailscale address only: disallow LAN/WAN access to admin endpoints even if port 80 is forwarded.
export function isAdminNetwork(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const local = process.env.BLOG_TAILSCALE_IP;
  // A valid Host header does not prove the incoming interface. An nftables rule
  // at deployment blocks /admin traffic from non-Tailscale peers at the socket.
  return !!local && host === local;
}

export function deny() { return Response.json({ error: "Forbidden" }, { status: 403 }); }
export function unauthorized() { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

export async function authenticated(request: NextRequest) {
  return validSession(request.cookies.get(sessionCookie)?.value);
}
export const cookieOptions = { httpOnly: true, sameSite: "strict" as const, path: "/admin", maxAge: sessionAge };
