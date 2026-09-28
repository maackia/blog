import type { Channel } from "./channels";
import { findPost, listPosts } from "./store";

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

function toPublicPost(post: ReturnType<typeof listPosts>[number]): Post {
  return {
    slug: post.slug, title: post.title, description: post.description,
    publishedAt: post.publishedAt!, updatedAt: post.updatedAt,
    channel: post.channel, tags: post.tags, coverImage: post.coverImage,
    featured: post.featured, draft: false, content: post.content,
  };
}

export function getAllPosts(): Post[] {
  return listPosts().map(toPublicPost);
}

export function getPostsByChannel(channel: Channel): Post[] {
  return getAllPosts().filter((post) => post.channel === channel);
}

export function getPostBySlug(slug: string, channel?: Channel): Post | undefined {
  const post = findPost(slug);
  return post && (!channel || post.channel === channel) ? toPublicPost(post) : undefined;
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
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
