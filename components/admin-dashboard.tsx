"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RestrictedMdx } from "@/lib/render-mdx";
import { assertSafeMdx } from "@/lib/safe-mdx";
import type { PostInput, StoredPost } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import "./admin.css";
import "./admin-theme.css";

type View = "dashboard" | "posts" | "editor" | "trash" | "settings";
const titles: Record<View, string> = { dashboard: "대시보드", posts: "글 관리", editor: "글 편집", trash: "휴지통", settings: "설정" };
const blank: PostInput = { slug: "", channel: "life", title: "", description: "", content: "", tags: [], featured: false, status: "draft" };
const date = (value: string) => new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" });

export function AdminDashboard({ initialLoggedIn, initialCsrf }: { initialLoggedIn: boolean; initialCsrf: string }) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [csrf, setCsrf] = useState(initialCsrf);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<PostInput>(blank);
  const [tagText, setTagText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(true);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("updated");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const active = posts.filter((post) => !post.deletedAt);
  const trashed = posts.filter((post) => !!post.deletedAt);
  const published = active.filter((post) => post.status === "published");
  const filtered = (view === "trash" ? trashed : active).filter((post) =>
    (channel === "all" || channel === post.channel) && (status === "all" || status === post.status) &&
    `${post.title} ${post.slug} ${post.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "title" ? a.title.localeCompare(b.title, "ko") : (sort === "published" ? b.publishedAt ?? "" : b.updatedAt).localeCompare(sort === "published" ? a.publishedAt ?? "" : a.updatedAt));
  let previewError = "";
  if (view === "editor" && preview) { try { assertSafeMdx(form.content); } catch (error) { previewError = String(error); } }

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/api/posts", { cache: "no-store" });
      if (response.status === 401) { setLoggedIn(false); throw new Error("세션이 만료되었습니다. 다시 로그인해 주세요."); }
      if (!response.ok) throw new Error("글 목록을 불러오지 못했습니다.");
      setPosts(await response.json());
    } catch (error) { setMessage(String(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (loggedIn) void refresh(); }, [loggedIn, refresh]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function leave() { return !dirty || confirm("저장하지 않은 변경사항이 있습니다. 버리고 이동할까요?"); }
  function navigate(next: View) { if (busy || !leave()) return; setView(next); setDirty(false); setMenu(false); setMessage(""); }
  function edit(post?: StoredPost) {
    if (busy || !leave()) return;
    setSelected(post?.slug ?? null); setForm(post ? { ...post } : { ...blank }); setTagText(post?.tags.join(", ") ?? "");
    setView("editor"); setDirty(false); setMenu(false); setMessage("");
  }
  function update(patch: Partial<PostInput>) { setForm((previous) => ({ ...previous, ...patch })); setDirty(true); }
  async function api(url: string, method: string, body?: unknown) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json", "x-csrf-token": csrf }, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error ?? `요청 실패 (${response.status}). 로그인 상태를 확인해 주세요.`); }
    return response.status === 204 ? null : response.json();
  }
  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const data = await api("/admin/api/login", "POST", { password }); setCsrf(data.csrf); setPassword(""); setLoggedIn(true); }
    catch (error) { setMessage(String(error)); } finally { setBusy(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const post = await api(selected ? `/admin/api/posts/${encodeURIComponent(selected)}` : "/admin/api/posts", selected ? "PUT" : "POST", { ...form, tags: [...new Set(tagText.split(",").map((tag) => tag.trim()).filter(Boolean))] });
      setSelected(post.slug); setForm(post); setTagText(post.tags.join(", ")); setDirty(false); setMessage(`저장했습니다 · ${date(post.updatedAt)}`); await refresh();
    } catch (error) { setMessage(String(error)); } finally { setBusy(false); }
  }
  async function action(post: StoredPost, kind: "trash" | "restore" | "purge" | "unpublish") {
    const prompt = kind === "purge" ? "영구 삭제하면 복구할 수 없습니다. 삭제할까요?" : kind === "trash" ? "이 글을 휴지통으로 이동할까요?" : null;
    if (prompt && !confirm(prompt)) return;
    setBusy(true); setMessage("");
    try {
      await api(`/admin/api/posts/${encodeURIComponent(post.slug)}${kind === "purge" ? "?permanent=true" : ""}`, kind === "restore" ? "PATCH" : kind === "unpublish" ? "PUT" : "DELETE", kind === "unpublish" ? { ...post, status: "draft" } : undefined);
      setMessage(kind === "restore" ? "임시저장 상태로 복원했습니다." : kind === "unpublish" ? "발행을 취소했습니다." : kind === "purge" ? "영구 삭제했습니다." : "휴지통으로 이동했습니다."); await refresh();
    } catch (error) { setMessage(String(error)); } finally { setBusy(false); }
  }
  async function logout() {
    if (!leave()) return;
    setBusy(true);
    try { await api("/admin/api/logout", "POST"); setLoggedIn(false); setCsrf(""); setPosts([]); setForm(blank); setSelected(null); setDirty(false); setView("dashboard"); }
    catch (error) { setMessage(String(error)); } finally { setBusy(false); }
  }
  async function passwordChange(event: React.FormEvent) {
    event.preventDefault();
    if (nextPassword !== confirmPassword) { setMessage("새 비밀번호 확인이 일치하지 않습니다."); return; }
    setBusy(true);
    try {
      await api("/admin/api/password", "POST", { current: currentPassword, next: nextPassword });
      setCurrentPassword(""); setNextPassword(""); setConfirmPassword(""); setCsrf(""); setLoggedIn(false); setPosts([]); setView("dashboard");
      setMessage("비밀번호를 변경했습니다. 모든 세션이 만료되었습니다. 새 비밀번호로 로그인해 주세요.");
    } catch (error) { setMessage(String(error)); } finally { setBusy(false); }
  }
  const stats = [["전체 글", active.length], ["발행", published.length], ["임시저장", active.length - published.length], ["휴지통", trashed.length]] as const;

  if (!loggedIn) return <main className="admin-app admin-login"><section className="admin-card"><div className="admin-login-theme"><ThemeToggle /></div><p className="admin-eyebrow">MAACKIA.LOG / ADMIN</p><h1>관리자 로그인</h1><p className="admin-muted">내 기록을 관리하는 공간</p><form onSubmit={login}><label>관리자 비밀번호<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="admin-primary" disabled={busy}>로그인</button></form>{message && <p role="status">{message}</p>}<Link href="/">← 블로그로 돌아가기</Link></section></main>;
  return <div className="admin-app admin-shell">
    <aside className={`admin-sidebar ${menu ? "is-open" : ""}`}><p className="admin-eyebrow">MAACKIA.LOG</p><strong className="admin-brand">관리자</strong><nav aria-label="관리자 메뉴">{(["dashboard", "posts", "trash", "settings"] as View[]).map((item) => <button key={item} aria-current={view === item ? "page" : undefined} onClick={() => navigate(item)} disabled={busy}>{titles[item]}{item === "trash" && <span>{trashed.length}</span>}</button>)}</nav><button className="admin-primary" onClick={() => edit()} disabled={busy}>+ 새 글</button><a className="admin-site-link" href="/" target="_blank" rel="noreferrer">블로그 보기 ↗</a><p className="admin-muted admin-sidebar-note">Tailscale 전용 · 개인 관리자<br />SQLite에 안전하게 저장</p></aside>
    <div className="admin-workspace"><header className="admin-topbar"><button className="admin-menu" aria-label="관리자 메뉴 열기" aria-expanded={menu} onClick={() => setMenu(!menu)}>☰</button><span>작업 공간 / {titles[view]}</span><div className="admin-topbar-actions"><ThemeToggle /><button onClick={logout} disabled={busy}>로그아웃</button></div></header>
    <main className="admin-content"><div className="admin-heading"><div><p className="admin-eyebrow">CONTENT STUDIO</p><h1>{view === "editor" && !selected ? "새 글 작성" : titles[view]}</h1></div>{view !== "editor" && <button className="admin-primary" onClick={() => edit()} disabled={busy}>+ 새 글 작성</button>}</div>
      {message && <div role="status" className="admin-notice">{message}</div>}
      {view === "dashboard" && <><section className="admin-stats" aria-label="글 통계">{stats.map(([label, count]) => <div className="admin-card" key={label}><p className="admin-muted">{label}</p><strong>{loading ? "—" : count}</strong></div>)}</section><section className="admin-card"><div className="admin-section-heading"><h2>최근 수정한 글</h2><button onClick={() => navigate("posts")}>전체 보기 →</button></div>{loading ? <p>불러오는 중…</p> : active.length === 0 ? <p className="admin-empty">아직 글이 없습니다. 첫 기록을 작성해 보세요.</p> : [...active].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0,5).map((post) => <button className="admin-recent" key={post.id} onClick={() => edit(post)}><span><strong>{post.title}</strong><small>{post.channel.toUpperCase()} · {date(post.updatedAt)}</small></span><span className={`admin-badge ${post.status}`}>{post.status === "published" ? "발행" : "임시저장"}</span></button>)}</section><section className="admin-card admin-help"><h2>오늘의 기록을 남겨보세요</h2><p>글은 임시저장한 뒤 미리보기로 확인하고 발행할 수 있습니다. 사진 업로드와 방문자 통계는 아직 제공하지 않습니다.</p></section></>}
      {(view === "posts" || view === "trash") && <section className="admin-card"><div className="admin-filters"><input aria-label="글 검색" placeholder="제목, 주소, 태그 검색" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="채널 필터" value={channel} onChange={(e) => setChannel(e.target.value)}><option value="all">모든 채널</option><option value="life">LIFE</option><option value="tech">TECH</option></select><select aria-label="상태 필터" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">모든 상태</option><option value="published">발행</option><option value="draft">임시저장</option></select><select aria-label="정렬" value={sort} onChange={(e) => setSort(e.target.value)}><option value="updated">최근 수정순</option><option value="published">최근 발행순</option><option value="title">제목순</option></select></div><p className="admin-muted">{filtered.length}개의 글{view === "trash" ? " · 복원하면 임시저장 상태로 돌아갑니다." : ""}</p><div className="admin-table-wrap"><table><colgroup><col className="admin-col-title" /><col className="admin-col-channel" /><col className="admin-col-status" /><col className="admin-col-date" /><col className="admin-col-actions" /></colgroup><thead><tr><th scope="col">제목</th><th scope="col">채널</th><th scope="col">상태</th><th scope="col">최근 수정</th><th scope="col">관리</th></tr></thead><tbody>{filtered.map((post) => <tr key={post.id}><td>{view === "trash" ? <strong>{post.title}</strong> : <button className="admin-title-link" onClick={() => edit(post)}>{post.title}</button>}<small>/{post.channel}/posts/{post.slug}</small></td><td><span className="admin-channel">{post.channel.toUpperCase()}</span></td><td><span className={`admin-badge ${post.status}`}>{post.status === "published" ? "발행" : "임시저장"}</span></td><td>{date(post.updatedAt)}</td><td><div className="admin-row-actions">{view === "trash" ? <><button onClick={() => action(post, "restore")} disabled={busy}>복원</button><button className="admin-danger" onClick={() => action(post, "purge")} disabled={busy}>영구 삭제</button></> : <><button onClick={() => edit(post)} disabled={busy}>편집</button>{post.status === "published" && <button onClick={() => action(post, "unpublish")} disabled={busy}>발행 취소</button>}<button className="admin-danger" onClick={() => action(post, "trash")} disabled={busy}>휴지통으로</button></>}</div></td></tr>)}</tbody></table></div>{!filtered.length && <p className="admin-empty">{loading ? "불러오는 중…" : "표시할 글이 없습니다."}</p>}</section>}
      {view === "editor" && <form onSubmit={save}><fieldset disabled={busy} className="admin-editor-fieldset"><div className="admin-editor-actions"><span role="status" className="admin-muted">{busy ? "저장 중…" : dirty ? "저장하지 않은 변경사항" : "변경사항 없음"}</span><button type="button" onClick={() => navigate("posts")}>목록으로</button><button className="admin-primary">저장</button></div><div className="admin-card admin-meta"><label>제목<input value={form.title} maxLength={200} onChange={(e) => update({ title: e.target.value })} required /></label><label>주소(slug)<input value={form.slug} maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(e) => update({ slug: e.target.value })} required /><small>영문 소문자·숫자·하이픈. 변경 시 이전 주소는 사라집니다.</small></label><label className="admin-full">설명<input value={form.description} maxLength={500} onChange={(e) => update({ description: e.target.value })} required /></label><label>채널<select value={form.channel} onChange={(e) => update({ channel: e.target.value as PostInput["channel"] })}><option value="life">LIFE</option><option value="tech">TECH</option></select></label><label>발행 상태<select value={form.status} onChange={(e) => update({ status: e.target.value as PostInput["status"] })}><option value="draft">임시저장</option><option value="published">발행</option></select></label><label>태그<input value={tagText} placeholder="daily, photo" onChange={(e) => { setTagText(e.target.value); setDirty(true); }} /></label><label>대표 이미지 경로<input value={form.coverImage ?? ""} placeholder="/images/posts/example/cover.jpg" onChange={(e) => update({ coverImage: e.target.value || undefined })} /></label><label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => update({ featured: e.target.checked })} />대표 글</label></div><section className="admin-card"><div className="admin-section-heading"><h2>MDX 본문</h2><button type="button" aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? "미리보기 닫기" : "미리보기 열기"}</button></div><p className="admin-muted">Markdown과 &lt;Callout title=&quot;팁&quot;&gt;텍스트&lt;/Callout&gt; 지원</p><div className={`admin-writing ${preview ? "with-preview" : ""}`}><textarea aria-label="MDX 본문" value={form.content} onChange={(e) => update({ content: e.target.value })} required maxLength={200000} />{preview && <div className="admin-preview prose prose-blog" aria-label="본문 미리보기">{previewError ? <p role="alert">{previewError}</p> : <RestrictedMdx source={form.content || "미리보기할 내용이 없습니다."} />}</div>}</div><small className="admin-muted">{form.content.length.toLocaleString()}자 · 자동저장되지 않습니다.</small></section></fieldset></form>}
      {view === "settings" && <div className="admin-settings-grid"><section className="admin-card admin-settings"><h2>관리자 비밀번호 변경</h2><p className="admin-muted">변경하면 다른 기기를 포함한 모든 로그인 세션이 만료됩니다.</p><form onSubmit={passwordChange}><label>현재 비밀번호<input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></label><label>새 비밀번호<input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} required /></label><label>새 비밀번호 확인<input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label><button className="admin-primary" disabled={busy}>비밀번호 변경</button></form></section><section className="admin-card admin-help"><h2>운영 안내</h2><p>글과 변경한 비밀번호 해시는 서버의 SQLite DB에 저장됩니다. DB는 GitHub에 업로드되지 않습니다.</p><p>사이트 제목·소개 편집, 미디어 업로드는 후속 기능입니다.</p></section></div>}
    </main></div>
  </div>;
}
