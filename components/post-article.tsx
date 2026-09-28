import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/posts";
import { RestrictedMdx } from "@/lib/render-mdx";

export function PostArticle({ post }: { post: Post }) {
  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-14 md:px-8 md:py-24">
      <Link
        className="text-muted hover:text-ink mb-12 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        href={`/${post.channel}`}
      >
        <ArrowLeft aria-hidden="true" size={17} />
        {post.channel === "life" ? "생활 기록" : "기술 기록"}
      </Link>

      <header className="border-ink/15 border-b pb-10">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Link
              className="bg-acid text-acid-ink rounded-full px-3 py-1 font-mono text-[0.68rem] font-bold uppercase"
              href={`/${post.channel}/tags/${tag}`}
              key={tag}
            >
              {tag}
            </Link>
          ))}
        </div>
        <h1 className="font-display text-4xl font-black leading-[1.05] tracking-[-0.055em] sm:text-5xl md:text-7xl">
          {post.title}
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-lg leading-8">{post.description}</p>
        <div className="text-muted mt-8 flex items-center gap-4 font-mono text-xs">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>태그 {post.tags.length}개</span>
        </div>
      </header>

      <div className="prose prose-lg prose-blog mt-12 max-w-none">
        <RestrictedMdx source={post.content} />
      </div>
    </article>
  );
}
