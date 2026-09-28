import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { closeDatabase } from "./db";
import { deletePost, findPost, listPosts, savePost, restorePost, purgePost } from "./store";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-store-"));
process.env.BLOG_DB_PATH = path.join(dir, "test.sqlite");
afterAll(() => { closeDatabase(); fs.rmSync(dir, { recursive: true, force: true }); });

const input = {
  slug: "first-post", channel: "tech" as const, title: "첫 글", description: "설명",
  content: "# 안녕", tags: ["tech"], featured: false, status: "draft" as const,
};

describe("SQLite post store", () => {
  it("hides drafts and retains publication date after edits", () => {
    savePost(input);
    expect(listPosts()).toHaveLength(0);
    expect(findPost("first-post")).toBeUndefined();
    const published = savePost({ ...input, status: "published" }, "first-post");
    expect(published.publishedAt).toBeTruthy();
    const updated = savePost({ ...input, status: "published", title: "수정" }, "first-post");
    expect(updated.publishedAt).toBe(published.publishedAt);
    expect(listPosts()).toHaveLength(1);
    expect(updated.title).toBe("수정");
    expect(deletePost("first-post")).toBe(true);
    expect(listPosts()).toHaveLength(0);
    expect(findPost("first-post", true)?.deletedAt).toBeTruthy();
    expect(restorePost("first-post")).toBe(true);
    expect(findPost("first-post")).toBeUndefined();
    expect(findPost("first-post", true)?.status).toBe("draft");
    expect(purgePost("first-post")).toBe(false);
    deletePost("first-post");
    expect(purgePost("first-post")).toBe(true);
  });
  it("rejects unsafe slugs and duplicate posts", () => {
    expect(findPost("../foo", true)).toBeUndefined();
    savePost(input);
    expect(() => savePost(input)).toThrow("SLUG_TAKEN");
  });
});
