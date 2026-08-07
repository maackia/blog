import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  try {
    const posts = getAllPosts();

    return Response.json({
      status: "ready",
      service: "blog",
      checks: { content: "ok" },
      publishedPosts: posts.length,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      {
        status: "not_ready",
        service: "blog",
        checks: { content: "failed" },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
