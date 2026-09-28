import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, expect, it } from "vitest";
import { closeDatabase, openDatabase } from "./db";
import { uploadMedia, removeMedia, listMedia, mediaUrl, MAX_UPLOAD_BYTES, MEDIA_QUOTA_BYTES } from "./media";
import { savePost, deletePost, purgePost } from "./store";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "media-test-"));
process.env.BLOG_DB_PATH = path.join(dir, "test.sqlite");
process.env.BLOG_MEDIA_DIR = path.join(dir, "media");
afterAll(() => { closeDatabase(); fs.rmSync(dir, { recursive: true, force: true }); });
const photo = () => sharp({ create: { width: 3000, height: 1500, channels: 3, background: "red" } }).jpeg().withMetadata().toBuffer();
it("optimizes, strips metadata, safely names and persists an image", async () => {
  const item = await uploadMedia(await photo(), "../../사진.jpg");
  expect(item.name).toBe("사진.jpg");
  expect(item.width).toBe(2048);
  expect(item.height).toBe(1024);
  const meta = await sharp(path.join(dir, "media", `${item.id}.webp`)).metadata();
  expect(meta.format).toBe("webp");
  expect(meta.exif).toBeUndefined();
  closeDatabase();
  expect(listMedia().items).toHaveLength(1);
  removeMedia(item.id);
  expect(fs.existsSync(path.join(dir, "media", `${item.id}.webp`))).toBe(false);
});
it("accepts a 50MiB JPEG and persists only its optimized WebP", async () => {
  const jpeg = await photo();
  const upload = Buffer.concat([jpeg, Buffer.alloc(MAX_UPLOAD_BYTES - jpeg.length)]);
  const item = await uploadMedia(upload, "large-camera.jpg");
  expect(item.original_bytes).toBe(50 * 1024 * 1024);
  expect(item.bytes).toBeLessThan(item.original_bytes);
  expect(fs.readdirSync(path.join(dir, "media"))).toEqual([`${item.id}.webp`]);
  removeMedia(item.id);
});
it("rejects corrupt, disguised SVG, oversized uploads and exceeded quota", async () => {
  await expect(uploadMedia(Buffer.from("not an image"), "x.jpg")).rejects.toThrow();
  await expect(uploadMedia(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'), "x.png")).rejects.toThrow();
  await expect(uploadMedia(Buffer.alloc(MAX_UPLOAD_BYTES + 1), "x.jpg")).rejects.toThrow();
  const item = await uploadMedia(await photo(), "quota.jpg");
  openDatabase().prepare("UPDATE media SET bytes=? WHERE id=?").run(MEDIA_QUOTA_BYTES, item.id);
  await expect(uploadMedia(await photo(), "full.jpg")).rejects.toThrow("1GB");
  removeMedia(item.id);
});
it("protects draft, cover and trash references; permits removal only after permanent post deletion", async () => {
  const item = await uploadMedia(await photo(), "test.jpg");
  const url = mediaUrl(item.id);
  const post = { slug: "media-post", channel: "life" as const, title: "사진", description: "테스트", content: `![사진](${url})`, coverImage: url, tags: [], featured: false, status: "draft" as const };
  savePost(post);
  expect(listMedia().items[0].usage).toHaveLength(1);
  expect(() => removeMedia(item.id)).toThrow("사용 중");
  deletePost(post.slug);
  expect(() => removeMedia(item.id)).toThrow("사용 중");
  purgePost(post.slug);
  removeMedia(item.id);
  expect(() => savePost(post)).toThrow("삭제되었습니다");
});
