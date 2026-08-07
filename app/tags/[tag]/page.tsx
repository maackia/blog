import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `${tag} 주제로 작성한 엔지니어링 노트입니다.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-orange font-mono text-xs font-bold tracking-[0.16em]">TOPIC INDEX</p>
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
