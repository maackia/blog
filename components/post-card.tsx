import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/posts";

type PostCardProps = {
  post: Post;
  index: number;
};

export function PostCard({ post, index }: PostCardProps) {
  return (
    <article className="border-ink/15 group grid gap-6 border-t py-7 transition-colors md:grid-cols-[5rem_1fr_auto] md:items-start md:py-9">
      <span className="text-muted font-mono text-xs">#{String(index + 1).padStart(2, "0")}</span>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <time className="text-muted text-xs font-semibold uppercase tracking-[0.12em]">
            {formatDate(post.publishedAt)}
          </time>
          {post.tags.map((tag) => (
            <Link
              className="bg-ink/6 hover:bg-acid rounded-full px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase transition-colors"
              href={`/tags/${tag}`}
              key={tag}
            >
              {tag}
            </Link>
          ))}
        </div>
        <h3 className="font-display max-w-3xl text-2xl font-bold tracking-[-0.04em] md:text-3xl">
          <Link className="underline-offset-4 hover:underline" href={`/posts/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        <p className="text-muted mt-3 max-w-2xl leading-7">{post.description}</p>
      </div>

      <Link
        aria-label={`${post.title} 읽기`}
        className="border-ink/15 hover:bg-acid grid size-11 place-items-center rounded-full border transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
        href={`/posts/${post.slug}`}
      >
        <ArrowUpRight aria-hidden="true" size={19} />
      </Link>
    </article>
  );
}
