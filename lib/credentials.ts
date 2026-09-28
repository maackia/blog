import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { openDatabase } from "./db";

export function credentials() {
  return openDatabase().prepare("SELECT password_hash, version FROM admin_credentials WHERE id=1").get() as { password_hash: string; version: string } | undefined;
}
export function passwordMatches(input: string) {
  const stored = credentials()?.password_hash ?? process.env.BLOG_ADMIN_PASSWORD_HASH ?? "";
  const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(stored);
  if (!match || input.length > 1024) return false;
  return timingSafeEqual(scryptSync(input, Buffer.from(match[1], "hex"), 64), Buffer.from(match[2], "hex"));
}
export function changePassword(current: string, next: string) {
  if (!passwordMatches(current)) throw new Error("현재 비밀번호가 일치하지 않습니다.");
  if (next.length < 12 || next.length > 128) throw new Error("새 비밀번호는 12~128자여야 합니다.");
  if (next === current) throw new Error("다른 비밀번호를 사용해 주세요.");
  const salt = randomBytes(16);
  const hash = `scrypt:${salt.toString("hex")}:${scryptSync(next, salt, 64).toString("hex")}`;
  openDatabase().prepare("INSERT INTO admin_credentials(id,password_hash,version) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash, version=excluded.version")
    .run(hash, randomBytes(16).toString("hex"));
}
