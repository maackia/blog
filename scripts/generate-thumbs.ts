import fs from "node:fs";
import { buildThumb, findMedia, mediaDirectory } from "../lib/media";

// Backfill for media uploaded before thumbnails existed. Run once after upgrading.
async function main() {
  const directory = mediaDirectory();
  if (!fs.existsSync(directory)) { console.log("미디어 디렉터리가 없습니다."); return; }
  let created = 0;
  for (const name of fs.readdirSync(directory).filter((file) => file.endsWith(".webp") && !file.endsWith("-thumb.webp"))) {
    const id = name.slice(0, -5);
    const item = findMedia(id);
    if (!item || item.thumb_bytes) continue;
    await buildThumb(id);
    created++;
  }
  console.log(`미리보기 ${created}개 생성`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
