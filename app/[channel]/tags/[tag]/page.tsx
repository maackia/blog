export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { channelConfig, isChannel } from "@/lib/channels";
import { getPostsByTag } from "@/lib/posts";

type ChannelTagPageProps = {
  params: Promise<{ channel: string; tag: string }>;
};

export async function generateMetadata({ params }: ChannelTagPageProps): Promise<Metadata> {
  const { channel, tag } = await params;

  if (!isChannel(channel)) {
    return {};
  }

  return {
    title: `#${tag} — ${channelConfig[channel].label}`,
    description: `${channelConfig[channel].label}의 ${tag} 기록 모음.`,
  };
}

export default async function ChannelTagPage({ params }: ChannelTagPageProps) {
  const { channel, tag } = await params;

  if (!isChannel(channel)) {
    notFound();
  }

  const posts = getPostsByTag(tag, channel);
  if (posts.length === 0) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-orange font-mono text-xs font-bold tracking-[0.16em]">
        {channelConfig[channel].label} / TOPIC INDEX
      </p>
      <h1 className="font-display mt-3 text-5xl font-black tracking-[-0.06em] md:text-7xl">
        #{tag}
      </h1>
      <p className="text-muted mt-5">#{tag} 기록 {posts.length}개</p>

      <div className="mt-14">
        {posts.map((post, index) => (
          <PostCard index={index} key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
