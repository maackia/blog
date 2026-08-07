import { describe, expect, it } from "vitest";
import { formatDate, getAllPosts, getPostBySlug } from "./posts";

describe("posts", () => {
  it("loads published posts in reverse chronological order", () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThan(1);
    expect(new Date(posts[0].publishedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(posts[1].publishedAt).getTime(),
    );
  });

  it("rejects unsafe or missing slugs", () => {
    expect(getPostBySlug("../package")).toBeUndefined();
    expect(getPostBySlug("missing-post")).toBeUndefined();
  });

  it("formats dates in Korean", () => {
    expect(formatDate("2026-08-07T00:00:00.000Z")).toContain("2026년");
  });
});
