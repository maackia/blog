import { describe, expect, it } from "vitest";
import { formatDate, getAllPosts, getPostBySlug, getPostsByChannel } from "./posts";

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
