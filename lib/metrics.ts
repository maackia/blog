import {
  Counter,
  Gauge,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

type MetricsState = {
  registry: Registry;
  scrapeCounter: Counter;
  postsGauge: Gauge;
};

const globalMetrics = globalThis as typeof globalThis & {
  blogMetrics?: MetricsState;
};

function createMetrics(): MetricsState {
  const registry = new Registry();
  registry.setDefaultLabels({ service: "blog" });
  collectDefaultMetrics({ prefix: "blog_", register: registry });

  const scrapeCounter = new Counter({
    name: "blog_metrics_scrapes_total",
    help: "Number of times the Prometheus metrics endpoint was scraped.",
    registers: [registry],
  });

  const postsGauge = new Gauge({
    name: "blog_published_posts",
    help: "Current number of published posts.",
    registers: [registry],
  });

  return { registry, scrapeCounter, postsGauge };
}

export const metrics = globalMetrics.blogMetrics ?? createMetrics();

if (process.env.NODE_ENV !== "production") {
  globalMetrics.blogMetrics = metrics;
}
