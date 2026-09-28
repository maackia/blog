import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

let connection: Database.Database | undefined;

export function openDatabase(file = process.env.BLOG_DB_PATH ?? path.join(process.cwd(), "data", "blog.sqlite")) {
  if (connection && connection.name === file) return connection;
  if (connection) connection.close();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      channel TEXT NOT NULL CHECK(channel IN ('life', 'tech')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      cover_image TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      published_at TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS posts_status_channel_date ON posts(status, channel, published_at DESC);
  `);
  connection = db;
  return db;
}

export function closeDatabase() {
  connection?.close();
  connection = undefined;
}
