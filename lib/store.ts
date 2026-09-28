import { z } from "zod";
import { openDatabase } from "./db";
import { assertSafeMdx } from "./safe-mdx";
import { validateMediaReferences } from "./media";
import type { Channel } from "./channels";

export const postInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  channel: z.enum(["life", "tech"]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(500),
  content: z.string().min(1).max(200_000),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  coverImage: z.string().regex(/^\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp|avif)$/).optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type PostInput = z.infer<typeof postInput>;
export type StoredPost = PostInput & {
  id: number;
  deletedAt?: string;
  publishedAt?: string;
  updatedAt: string;
};

type Row = {
  id: number; slug: string; channel: Channel; title: string; description: string;
  content: string; tags: string; cover_image: string | null; featured: number;
  status: "draft" | "published"; published_at: string | null; updated_at: string; deleted_at: string | null;
};

function toPost(row: Row): StoredPost {
  return {
    id: row.id, slug: row.slug, channel: row.channel, title: row.title,
    description: row.description, content: row.content,
    tags: JSON.parse(row.tags) as string[], coverImage: row.cover_image ?? undefined,
    featured: !!row.featured, status: row.status,
    publishedAt: row.published_at ?? undefined, updatedAt: row.updated_at, deletedAt: row.deleted_at ?? undefined,
  };
}

export function listPosts(includeDrafts = false): StoredPost[] {
  const db = openDatabase();
  const rows = db.prepare(`SELECT * FROM posts ${includeDrafts ? "" : "WHERE status = 'published' AND deleted_at IS NULL"} ORDER BY published_at DESC, id DESC`).all() as Row[];
  return rows.map(toPost);
}

export function findPost(slug: string, includeDrafts = false): StoredPost | undefined {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  const row = openDatabase().prepare(`SELECT * FROM posts WHERE slug = ? ${includeDrafts ? "" : "AND status = 'published' AND deleted_at IS NULL"}`).get(slug) as Row | undefined;
  return row ? toPost(row) : undefined;
}

export function savePost(value: PostInput, oldSlug?: string): StoredPost {
  const data = postInput.parse(value);
  assertSafeMdx(data.content);
  validateMediaReferences(`${data.content}\n${data.coverImage ?? ""}`);
  const db = openDatabase();
  const previous = oldSlug ? findPost(oldSlug, true) : undefined;
  if (oldSlug && (!previous || previous.deletedAt)) throw new Error("POST_NOT_FOUND");
  if ((!oldSlug || oldSlug !== data.slug) && findPost(data.slug, true)) throw new Error("SLUG_TAKEN");
  const now = new Date().toISOString();
  const publishedAt = data.status === "published" ? previous?.publishedAt ?? now : previous?.publishedAt ?? null;
  if (previous) {
    db.prepare(`UPDATE posts SET slug=?, channel=?, title=?, description=?, content=?, tags=?, cover_image=?, featured=?, status=?, published_at=?, updated_at=? WHERE id=?`)
      .run(data.slug, data.channel, data.title, data.description, data.content, JSON.stringify(data.tags), data.coverImage ?? null, Number(data.featured), data.status, publishedAt, now, previous.id);
  } else {
    db.prepare(`INSERT INTO posts (slug,channel,title,description,content,tags,cover_image,featured,status,published_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(data.slug, data.channel, data.title, data.description, data.content, JSON.stringify(data.tags), data.coverImage ?? null, Number(data.featured), data.status, publishedAt, now);
  }
  return findPost(data.slug, true)!;
}

export function deletePost(slug: string) {
  return openDatabase().prepare("UPDATE posts SET deleted_at = ?, updated_at = ? WHERE slug = ? AND deleted_at IS NULL")
    .run(new Date().toISOString(), new Date().toISOString(), slug).changes > 0;
}

export function restorePost(slug: string) {
  // Restoring never accidentally republishes deleted material.
  return openDatabase().prepare("UPDATE posts SET deleted_at = NULL, status = 'draft', updated_at = ? WHERE slug = ? AND deleted_at IS NOT NULL")
    .run(new Date().toISOString(), slug).changes > 0;
}

export function purgePost(slug: string) {
  return openDatabase().prepare("DELETE FROM posts WHERE slug = ? AND deleted_at IS NOT NULL").run(slug).changes > 0;
}
