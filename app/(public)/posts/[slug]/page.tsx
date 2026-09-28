export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";

type LegacyPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyPostPage({ params }: LegacyPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  redirect(`/${post.channel}/posts/${post.slug}`);
}
