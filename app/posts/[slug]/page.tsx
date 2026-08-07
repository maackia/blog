import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { formatDate, getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${siteConfig.url}/posts/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-14 md:px-8 md:py-24">
      <Link
        className="text-muted hover:text-ink mb-12 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        href="/"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        전체 기록
      </Link>

      <header className="border-ink/15 border-b pb-10">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Link
              className="bg-acid rounded-full px-3 py-1 font-mono text-[0.68rem] font-bold uppercase"
              href={`/tags/${tag}`}
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
        <div className="mt-8 flex items-center gap-4 font-mono text-xs text-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.tags.length} topics</span>
        </div>
      </header>

      <div className="prose prose-lg prose-blog mt-12 max-w-none">
        <MDXRemote
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          source={post.content}
        />
      </div>
    </article>
  );
}
