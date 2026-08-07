import { getAllPosts } from "@/lib/posts";
import { metrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  metrics.scrapeCounter.inc();
  metrics.postsGauge.set(getAllPosts().length);

  return new Response(await metrics.registry.metrics(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": metrics.registry.contentType,
    },
  });
}
