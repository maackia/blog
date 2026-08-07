import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { channelConfig, channels, isChannel } from "@/lib/channels";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type ChannelTagPageProps = {
  params: Promise<{ channel: string; tag: string }>;
};

export function generateStaticParams() {
  return channels.flatMap((channel) =>
    getAllTags(channel).map((tag) => ({ channel, tag })),
  );
}

export async function generateMetadata({ params }: ChannelTagPageProps): Promise<Metadata> {
  const { channel, tag } = await params;

  if (!isChannel(channel)) {
    return {};
  }

  return {
    title: `#${tag} — ${channelConfig[channel].label}`,
    description: `${channelConfig[channel].label}에서 ${tag} 주제로 작성한 기록입니다.`,
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
      <p className="text-muted mt-5">이 주제로 작성한 기록 {posts.length}개</p>

      <div className="mt-14">
        {posts.map((post, index) => (
          <PostCard index={index} key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
