import { notFound, redirect } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type LegacyPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function LegacyPostPage({ params }: LegacyPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  redirect(`/${post.channel}/posts/${post.slug}`);
}
