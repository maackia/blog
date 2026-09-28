import type { MetadataRoute } from "next";
import { channels } from "@/lib/channels";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/${post.channel}/posts/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const channelPages = channels.map((channel) => ({
    url: `${siteConfig.url}/${channel}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const tags = channels.flatMap((channel) =>
    getAllTags(channel).map((tag) => ({
      url: `${siteConfig.url}/${channel}/tags/${tag}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...channelPages,
    ...posts,
    ...tags,
  ];
}
