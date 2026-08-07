import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Channel } from "@/lib/channels";

const postsDirectory = path.join(process.cwd(), "content", "posts");

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.coerce.date(),
  channel: z.enum(["life", "tech"]),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string().min(1)).default([]),
  coverImage: z.string().startsWith("/").optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type Post = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  channel: Channel;
  tags: string[];
  coverImage?: string;
  featured: boolean;
  draft: boolean;
  content: string;
};

function parsePost(fileName: string): Post {
  const slug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = frontmatterSchema.parse(data);

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    publishedAt: frontmatter.publishedAt.toISOString(),
    updatedAt: frontmatter.updatedAt?.toISOString(),
    channel: frontmatter.channel,
    tags: frontmatter.tags,
    coverImage: frontmatter.coverImage,
    featured: frontmatter.featured,
    draft: frontmatter.draft,
    content,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(parsePost)
    .filter((post) => !post.draft)
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime(),
    );
}

export function getPostsByChannel(channel: Channel): Post[] {
  return getAllPosts().filter((post) => post.channel === channel);
}

export function getPostBySlug(slug: string, channel?: Channel): Post | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return undefined;
  }

  const filePath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const post = parsePost(`${slug}.mdx`);
  return channel && post.channel !== channel ? undefined : post;
}

export function getAllTags(channel?: Channel): string[] {
  const posts = channel ? getPostsByChannel(channel) : getAllPosts();
  return [...new Set(posts.flatMap((post) => post.tags))].sort();
}

export function getPostsByTag(tag: string, channel?: Channel): Post[] {
  const posts = channel ? getPostsByChannel(channel) : getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
