"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PostInput, StoredPost } from "@/lib/store";

const blank: PostInput = {
  slug: "", channel: "life", title: "", description: "", content: "",
  tags: [], featured: false, status: "draft",
};

export function AdminDashboard({ initialLoggedIn, initialCsrf }: { initialLoggedIn: boolean; initialCsrf: string }) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [csrf, setCsrf] = useState(initialCsrf);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<PostInput>(blank);
  const [tagText, setTagText] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/admin/api/posts", { cache: "no-store" });
    if (response.ok) setPosts(await response.json());
    else if (response.status === 401) setLoggedIn(false);
  }, []);
  useEffect(() => { if (loggedIn) void refresh(); }, [loggedIn, refresh]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setBusy(true);
    try {
      const response = await fetch("/admin/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error("로그인에 실패했습니다.");
      const data = await response.json();
      setCsrf(data.csrf); setPassword(""); setLoggedIn(true);
    } catch (error) { setMessage(String(error)); }
    finally { setBusy(false); }
  }

  function edit(post: StoredPost) {
    setSelected(post.slug);
    setForm({ slug: post.slug, channel: post.channel, title: post.title,
      description: post.description, content: post.content, tags: post.tags,
      coverImage: post.coverImage, featured: post.featured, status: post.status });
    setTagText(post.tags.join(", ")); setMessage("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const url = selected ? `/admin/api/posts/${encodeURIComponent(selected)}` : "/admin/api/posts";
      const response = await fetch(url, {
        method: selected ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ ...form, tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "저장 실패");
      setSelected(data.slug); setForm({ ...form, slug: data.slug });
      setMessage("저장했습니다."); await refresh();
    } catch (error) { setMessage(String(error)); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || !confirm("이 글을 영구 삭제하시겠습니까?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/admin/api/posts/${encodeURIComponent(selected)}`, {
        method: "DELETE", headers: { "x-csrf-token": csrf },
      });
      if (!response.ok) throw new Error("삭제 실패");
      setSelected(null); setForm(blank); setTagText(""); setMessage("삭제했습니다."); await refresh();
    } catch (error) { setMessage(String(error)); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/admin/api/logout", { method: "POST", headers: { "x-csrf-token": csrf } });
    setLoggedIn(false); setCsrf(""); setPosts([]);
  }

  return <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
    <div className="mb-10 flex items-center justify-between">
      <h1 className="font-display text-4xl font-black">글 관리</h1>
      {loggedIn ? <button className="underline" onClick={logout}>로그아웃</button> : null}
    </div>
    {!loggedIn ? <form className="max-w-md space-y-4" onSubmit={login}>
      <label className="block">관리자 비밀번호
        <input className="border-ink/30 bg-paper mt-2 w-full rounded border p-3" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <button className="bg-ink text-paper rounded px-5 py-3" disabled={busy}>로그인</button>
    </form> : <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="space-y-3">
        <button className="bg-ink text-paper rounded px-4 py-2" onClick={() => { setSelected(null); setForm(blank); setTagText(""); setMessage(""); }}>+ 새 글</button>
        <ul className="space-y-2">{posts.map((post) => <li key={post.id}>
          <button className="text-left underline" onClick={() => edit(post)}>{post.title} ({post.status === "draft" ? "임시저장" : "발행"})</button>
        </li>)}</ul>
      </aside>
      <form className="space-y-5" onSubmit={save}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>제목<input className="border-ink/30 bg-paper mt-1 w-full rounded border p-3" value={form.title} maxLength={200} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label>주소(slug)<input className="border-ink/30 bg-paper mt-1 w-full rounded border p-3" value={form.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></label>
        </div>
        <label className="block">설명<input className="border-ink/30 bg-paper mt-1 w-full rounded border p-3" value={form.description} maxLength={500} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
        <div className="flex flex-wrap gap-5">
          <label>채널 <select className="bg-paper border rounded p-2" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as PostInput["channel"] })}><option value="life">LIFE</option><option value="tech">TECH</option></select></label>
          <label>상태 <select className="bg-paper border rounded p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PostInput["status"] })}><option value="draft">임시저장</option><option value="published">발행</option></select></label>
          <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> 대표 글</label>
        </div>
        <label className="block">태그 (쉼표로 구분)<input className="border-ink/30 bg-paper mt-1 w-full rounded border p-3" value={tagText} onChange={(e) => setTagText(e.target.value)} /></label>
        <label className="block">대표 이미지 경로 (선택)<input className="border-ink/30 bg-paper mt-1 w-full rounded border p-3" value={form.coverImage ?? ""} onChange={(e) => setForm({ ...form, coverImage: e.target.value || undefined })} placeholder="/images/posts/example/cover.jpg" /></label>
        <label className="block">MDX 본문 (Markdown + &lt;Callout title=&quot;팁&quot;&gt;...&lt;/Callout&gt;)
          <textarea className="border-ink/30 bg-paper mt-2 min-h-96 w-full rounded border p-4 font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <button className="bg-ink text-paper rounded px-5 py-3" disabled={busy}>저장</button>
          {selected ? <button type="button" className="text-red-700 underline" onClick={remove} disabled={busy}>글 삭제</button> : null}
          {selected && form.status === "published" ? <Link className="underline" target="_blank" href={`/${form.channel}/posts/${form.slug}`}>공개 글 보기</Link> : null}
        </div>
      </form>
    </div>}
    {message ? <p role="status" className="mt-6">{message}</p> : null}
  </main>;
}
