"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Media, MediaUse } from "@/lib/media";
import "./media-library.css";

type Item = Media & { url: string; usage: MediaUse[] };
type Listing = { items: Item[]; usedBytes: number; quotaBytes: number; maxUploadBytes: number };
const size = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
export function MediaLibrary({ csrf, onSelect, onBusyChange }: {
  csrf: string;
  onSelect?: (url: string, target: "body" | "cover") => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [data, setData] = useState<Listing | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(24);
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const load = useCallback(async () => {
    const response = await fetch("/admin/api/media", { cache: "no-store" });
    if (!response.ok) throw new Error("미디어를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.");
    setData(await response.json());
  }, []);
  useEffect(() => { void load().catch((error) => setMessage(String(error))); }, [load]);
  const begin = () => { lock.current = true; setBusy(true); onBusyChange(true); };
  const end = () => { lock.current = false; setBusy(false); onBusyChange(false); };

  async function upload(files: File[]) {
    if (lock.current || !files.length) return;
    if (files.length > 20) { setMessage("한 번에 최대 20장까지 선택해 주세요."); return; }
    begin();
    const failures: string[] = [];
    let completed = 0;
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        setMessage(`${index + 1}/${files.length} 업로드 중 · ${file.name}`);
        if (file.size > 10 * 1024 * 1024) { failures.push(`${file.name}: 10MB 초과`); continue; }
        try {
          const response = await fetch("/admin/api/media", { method: "POST", headers: { "Content-Type": "application/octet-stream", "x-csrf-token": csrf, "x-file-name": encodeURIComponent(file.name) }, body: file });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "업로드 실패");
          completed++;
        } catch (error) { failures.push(`${file.name}: ${String(error)}`); }
      }
      await load();
      setQuery(""); setVisible(24);
      setMessage(`${completed}장 업로드 완료.${failures.length ? ` 실패: ${failures.join(" / ")}` : " 사진을 선택해서 글에 넣어 보세요."}`);
    } catch (error) { setMessage(String(error)); }
    finally { end(); if (input.current) input.current.value = ""; }
  }
  async function remove(item: Item) {
    if (lock.current || !confirm(`“${item.name}” 사진을 영구 삭제할까요? 복구할 수 없습니다.`)) return;
    begin();
    try {
      const response = await fetch(`/admin/api/media/${item.id}`, { method: "DELETE", headers: { "x-csrf-token": csrf } });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error ?? "삭제 실패"); }
      await load(); setMessage("사진을 삭제했습니다.");
    } catch (error) { setMessage(String(error)); } finally { end(); }
  }
  async function copy(item: Item) {
    try { await navigator.clipboard.writeText(new URL(item.url, window.location.origin).href); setMessage("사진 주소를 복사했습니다."); }
    catch { setMessage("이 브라우저에서는 자동 복사가 지원되지 않습니다. 사진 아래 주소를 클릭해 선택한 후 복사해 주세요."); }
  }
  const items = data?.items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())) ?? [];
  return <section className="admin-card media-library" aria-label={onSelect ? "편집기 사진 선택" : "미디어 보관함"}>
    <div className="admin-section-heading"><h2>{onSelect ? "사진 선택·업로드" : "사진 보관함"}</h2><span className="admin-muted">{data ? `${size(data.usedBytes)} / 1 GB · ${data.items.length}장` : "불러오는 중…"}</span></div>
    <div className={`media-dropzone ${dragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(Array.from(event.dataTransfer.files)); }}>
      <p>사진을 여기에 끌어 놓거나 파일을 선택하세요.</p>
      <button className="admin-primary" type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? "사진 처리 중…" : "사진 업로드"}</button>
      <input ref={input} className="media-file-input" aria-label="사진 파일" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void upload(Array.from(event.target.files ?? []))} disabled={busy} />
      <small>JPEG · PNG · 정지 WebP / 장당 10MB · 4천만 화소 이하 / 한 번에 20장</small>
      <small>긴 변 최대 2048px의 WebP로 변환하며 위치·촬영 정보를 제거합니다. 원본은 따로 보관하세요.</small>
    </div>
    {message && <p role="status" className="admin-notice media-message">{message}</p>}
    <p className="admin-muted media-policy">사진 주소를 아는 사람은 이미지를 볼 수 있습니다. 민감한 사진은 올리지 마세요. 저장된 글(임시저장·휴지통 포함)에서 사용 중인 사진은 삭제할 수 없습니다.</p>
    <label className="media-search">사진 검색<input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(24); }} placeholder="파일 이름으로 검색" /></label>
    <div className="media-grid">{items.slice(0, visible).map((item) => <article className="media-item" key={item.id}>
      <div className="media-thumbnail"><Image src={item.url} alt={item.name} width={item.width} height={item.height} unoptimized loading="lazy" /></div>
      <div className="media-details"><strong className="media-name">{item.name}</strong><small>{item.width} × {item.height} · {size(item.bytes)} <span>(업로드 {size(item.original_bytes)})</span></small>
        <label className="media-url-label">사진 주소<input aria-label={`${item.name} 주소`} readOnly value={item.url} onFocus={(event) => event.currentTarget.select()} /></label>
        {item.usage.length ? <details><summary>사용 중 · {item.usage.length}개 글</summary><ul>{item.usage.map((post) => <li key={post.slug}>{post.title} ({post.deleted_at ? "휴지통" : post.status === "draft" ? "임시저장" : "발행"})</li>)}</ul></details> : <small>저장된 글에서 사용하지 않음</small>}
        <div className="media-actions">{onSelect ? <><button type="button" disabled={busy} onClick={() => onSelect(item.url, "body")}>본문에 삽입</button><button type="button" disabled={busy} onClick={() => onSelect(item.url, "cover")}>대표 이미지로</button></> : <><button type="button" onClick={() => void copy(item)} disabled={busy}>주소 복사</button><button type="button" className="admin-danger" onClick={() => void remove(item)} disabled={busy || item.usage.length > 0} title={item.usage.length ? "참조하는 모든 글에서 사진을 제거한 후 삭제하세요." : "영구 삭제"}>사진 삭제</button></>}</div>
      </div>
    </article>)}</div>
    {data && !items.length && <p className="admin-empty">{query ? "검색 결과가 없습니다." : "아직 업로드한 사진이 없습니다."}</p>}
    {items.length > visible && <button type="button" onClick={() => setVisible(visible + 24)}>사진 더 보기 ({items.length - visible}장)</button>}
  </section>;
}
