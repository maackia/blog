import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDatabase } from "./db";
import { savePost } from "./store";
import { formatDate, getAllPosts, getPostBySlug, getPostsByChannel } from "./posts";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-public-"));
beforeAll(() => {
  process.env.BLOG_DB_PATH = path.join(dir, "posts.sqlite");
  for (const [channel, slug] of [["life", "what-i-want-to-keep-here"], ["tech", "test-tech"]] as const) {
    savePost({ slug, channel, title: slug, description: "test", content: "hello", tags: [], featured: false, status: "published" });
  }
});
afterAll(() => { closeDatabase(); fs.rmSync(dir, { recursive: true, force: true }); });

describe("posts", () => {
  it("loads published posts in reverse chronological order", () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].title).toBeTruthy();
    expect(posts.every((post) => ["life", "tech"].includes(post.channel))).toBe(true);
  });

  it("separates life and tech posts", () => {
    expect(getPostsByChannel("life").length).toBeGreaterThan(0);
    expect(getPostsByChannel("tech").length).toBeGreaterThan(0);
  });

  it("rejects unsafe or missing slugs", () => {
    expect(getPostBySlug("../package")).toBeUndefined();
    expect(getPostBySlug("missing-post")).toBeUndefined();
    expect(getPostBySlug("what-i-want-to-keep-here", "tech")).toBeUndefined();
  });

  it("formats dates in Korean", () => {
    expect(formatDate("2026-08-07T00:00:00.000Z")).toContain("2026년");
  });
});
