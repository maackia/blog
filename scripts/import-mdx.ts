import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { closeDatabase, openDatabase } from "../lib/db";
import { findPost, savePost } from "../lib/store";

const directory = path.resolve(import.meta.dirname, "../content/posts");
let imported = 0;
for (const name of fs.readdirSync(directory).filter((file) => file.endsWith(".mdx"))) {
  const slug = name.slice(0, -4);
  if (findPost(slug, true)) continue;
  const { data, content } = matter(fs.readFileSync(path.join(directory, name), "utf8"));
  const post = savePost({
    slug,
    channel: data.channel,
    title: data.title,
    description: data.description,
    content,
    tags: data.tags ?? [],
    coverImage: data.coverImage,
    featured: data.featured ?? false,
    status: data.draft ? "draft" : "published",
  });
  const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : null;
  const updatedAt = data.updatedAt ? new Date(data.updatedAt).toISOString() : publishedAt;
  openDatabase().prepare("UPDATE posts SET published_at=?, updated_at=? WHERE id=?")
    .run(publishedAt, updatedAt ?? new Date().toISOString(), post.id);
  imported++;
}
closeDatabase();
console.log(`Imported ${imported} posts (existing slugs skipped).`);
