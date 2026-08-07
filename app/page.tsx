import { ArrowDownRight, Braces, Container, Telescope } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { StatusPanel } from "@/components/status-panel";
import { getAllPosts } from "@/lib/posts";

const interests = [
  { icon: Braces, label: "React & Web" },
  { icon: Container, label: "Kubernetes" },
  { icon: Telescope, label: "Observability" },
] as const;

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 pt-14 md:px-8 md:pt-24 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
        <div>
          <div className="mb-8 flex flex-wrap gap-2">
            {interests.map(({ icon: Icon, label }) => (
              <span
                className="border-ink/15 flex items-center gap-2 rounded-full border bg-white/35 px-3 py-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em]"
                key={label}
              >
                <Icon aria-hidden="true" size={13} />
                {label}
              </span>
            ))}
          </div>

          <p className="text-orange mb-4 font-mono text-xs font-bold tracking-[0.18em]">
            ENGINEERING NOTES / SEOUL
          </p>
          <h1 className="font-display max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.065em] sm:text-6xl md:text-8xl">
            만들고,
            <br />
            배포하고,
            <br />
            <span className="relative inline-block">
              관찰합니다.
              <span className="bg-acid absolute bottom-[0.08em] left-0 -z-10 h-[0.24em] w-full -rotate-1" />
            </span>
          </h1>
          <p className="text-muted mt-8 max-w-2xl text-lg leading-8 md:text-xl">
            코드가 컨테이너가 되고, 클러스터 위에서 지표와 로그를 남기기까지.
            직접 부딪히며 알게 된 것들을 오래 남는 글로 정리합니다.
          </p>

          <Link
            className="bg-ink text-paper hover:bg-orange mt-9 inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold transition-colors"
            href="#latest"
          >
            최근 기록 보기
            <ArrowDownRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <StatusPanel />
      </section>

      <section className="technical-grid border-ink/15 border-y">
        <div className="mx-auto grid w-full max-w-7xl gap-px bg-ink/15 md:grid-cols-3">
          {[
            ["01", "Build", "작은 기능도 배포 가능한 단위로 만듭니다."],
            ["02", "Run", "컨테이너와 Kubernetes에서 직접 운영합니다."],
            ["03", "Observe", "메트릭·로그·트레이스로 상태를 이해합니다."],
          ].map(([number, title, description]) => (
            <div className="bg-paper/92 p-6 md:p-8" key={number}>
              <span className="text-orange font-mono text-xs">/{number}</span>
              <h2 className="font-display mt-8 text-2xl font-bold tracking-[-0.04em]">
                {title}
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-28" id="latest">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-orange font-mono text-xs font-bold tracking-[0.16em]">
              LATEST NOTES
            </p>
            <h2 className="font-display mt-3 text-4xl font-black tracking-[-0.055em] md:text-6xl">
              최근 기록
            </h2>
          </div>
          <span className="text-muted hidden font-mono text-xs md:block">
            {String(posts.length).padStart(2, "0")} POSTS INDEXED
          </span>
        </div>

        <div>
          {posts.map((post, index) => (
            <PostCard index={index} key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
