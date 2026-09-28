import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { openDatabase } from "./db";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MEDIA_QUOTA_BYTES = 1024 * 1024 * 1024;
export type Media = { id: string; name: string; width: number; height: number; bytes: number; original_bytes: number; created_at: string };
export type MediaUse = { slug: string; title: string; status: string; deleted_at: string | null };
export class MediaError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function mediaDirectory() {
  return process.env.BLOG_MEDIA_DIR ?? path.join(path.dirname(process.env.BLOG_DB_PATH ?? path.join(process.cwd(), "data/blog.sqlite")), "media");
}
export function mediaUrl(id: string) { return `/media/${id}.webp`; }
export function findMedia(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return undefined;
  return openDatabase().prepare("SELECT * FROM media WHERE id=?").get(id) as Media | undefined;
}
export function mediaUsage(id: string): MediaUse[] {
  // Conservative matching also protects references in code, links and the trash.
  return openDatabase().prepare("SELECT slug,title,status,deleted_at FROM posts WHERE instr(content,?) > 0 OR instr(COALESCE(cover_image,''),?) > 0")
    .all(id, id) as MediaUse[];
}
export function listMedia() {
  const db = openDatabase();
  const items = db.prepare("SELECT * FROM media ORDER BY created_at DESC, id").all() as Media[];
  return { items: items.map((item) => ({ ...item, url: mediaUrl(item.id), usage: mediaUsage(item.id) })), usedBytes: items.reduce((total, item) => total + item.bytes, 0), quotaBytes: MEDIA_QUOTA_BYTES, maxUploadBytes: MAX_UPLOAD_BYTES };
}
export function validateMediaReferences(text: string) {
  for (const match of text.matchAll(/\/media\/([a-f0-9-]{36})\.webp/g)) {
    if (!findMedia(match[1])) throw new MediaError("선택한 사진이 삭제되었습니다. 다른 사진을 선택해 주세요.");
  }
}

let processing = false;
export async function uploadMedia(input: Buffer, filename: string): Promise<Media> {
  if (!input.length || input.length > MAX_UPLOAD_BYTES) throw new MediaError("사진은 장당 10MB 이하로 올려 주세요.", 413);
  // One decode at a time avoids overwhelming the Pi with simultaneous uploads.
  if (processing) throw new MediaError("다른 사진을 처리 중입니다. 잠시 후 다시 시도해 주세요.", 429);
  processing = true;
  try {
    let result;
    try {
      const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "warning" });
      const metadata = await image.metadata();
      if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
        throw new MediaError("JPEG, PNG, 정지 WebP만 지원합니다. GIF·SVG·움직이는 사진은 지원하지 않습니다.");
      }
      // Auto-orient before resizing; default output strips EXIF/GPS metadata.
      result = await image.rotate().resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    } catch (error) {
      if (error instanceof MediaError) throw error;
      throw new MediaError("읽을 수 없는 이미지이거나 최대 4천만 화소를 초과했습니다.");
    }
    const item: Media = { id: randomUUID(), name: path.basename(filename.replaceAll("\\", "/")).replace(/[\u0000-\u001f]/g, "").slice(0, 180) || "사진", width: result.info.width, height: result.info.height, bytes: result.data.length, original_bytes: input.length, created_at: new Date().toISOString() };
    const directory = mediaDirectory();
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (fs.statfsSync(directory).bavail * fs.statfsSync(directory).bsize < item.bytes + 256 * 1024 * 1024) throw new MediaError("디스크 여유 공간이 부족합니다.", 507);
    const db = openDatabase();
    const file = path.join(directory, `${item.id}.webp`);
    db.transaction(() => {
      const { total } = db.prepare("SELECT COALESCE(SUM(bytes),0) total FROM media").get() as { total: number };
      if (total + item.bytes > MEDIA_QUOTA_BYTES) throw new MediaError("미디어 저장 한도 1GB를 초과했습니다.", 413);
      fs.writeFileSync(file, result.data, { flag: "wx", mode: 0o600 });
      try { db.prepare("INSERT INTO media(id,name,width,height,bytes,original_bytes,created_at) VALUES(?,?,?,?,?,?,?)").run(item.id,item.name,item.width,item.height,item.bytes,item.original_bytes,item.created_at); }
      catch (error) { fs.unlinkSync(file); throw error; }
    })();
    return item;
  } finally { processing = false; }
}

export function removeMedia(id: string) {
  const db = openDatabase();
  db.transaction(() => {
    if (!findMedia(id)) throw new MediaError("사진을 찾을 수 없습니다.", 404);
    if (mediaUsage(id).length) throw new MediaError("글에서 사용 중인 사진입니다. 임시저장·휴지통의 글에서도 사진 참조를 먼저 제거해 주세요.", 409);
    // Unlink first: on filesystem failure keep the DB row and return an error.
    try { fs.unlinkSync(path.join(mediaDirectory(), `${id}.webp`)); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    db.prepare("DELETE FROM media WHERE id=?").run(id);
  })();
}
