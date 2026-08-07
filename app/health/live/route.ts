export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return Response.json({
    status: "ok",
    service: "blog",
    version: process.env.APP_VERSION ?? "development",
    revision: process.env.GIT_SHA ?? "local",
    timestamp: new Date().toISOString(),
  });
}
