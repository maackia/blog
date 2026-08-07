import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/post-article";
import { isChannel } from "@/lib/channels";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

type ChannelPostPageProps = {
  params: Promise<{ channel: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ channel: post.channel, slug: post.slug }));
}

export async function generateMetadata({ params }: ChannelPostPageProps): Promise<Metadata> {
  const { channel, slug } = await params;

  if (!isChannel(channel)) {
    return {};
  }

  const post = getPostBySlug(slug, channel);
  if (!post) {
    return {};
  }

  const url = `/${post.channel}/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${siteConfig.url}${url}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ChannelPostPage({ params }: ChannelPostPageProps) {
  const { channel, slug } = await params;

  if (!isChannel(channel)) {
    notFound();
  }

  const post = getPostBySlug(slug, channel);
  if (!post) {
    notFound();
  }

  return <PostArticle post={post} />;
}
