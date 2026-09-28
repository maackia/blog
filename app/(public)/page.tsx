import { ArrowUpRight, Camera, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { getPostsByChannel } from "@/lib/posts";

export const dynamic = "force-dynamic";

const entries = [
  {
    href: "/life",
    number: "01",
    label: "LIFE LOG",
    title: "살아가는 장면",
    description: "일상과 취미, 오래 보고 싶은 사진들.",
    icon: Camera,
  },
  {
    href: "/tech",
    number: "02",
    label: "TECH LOG",
    title: "만들고 운영한 것",
    description: "개발부터 배포와 관측까지, 직접 부딪힌 기록.",
    icon: TerminalSquare,
  },
] as const;

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-orange font-mono text-xs font-bold tracking-[0.18em]">
        ONE PERSON / TWO LOGS
      </p>
      <h1 className="font-display mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.065em] sm:text-6xl md:text-8xl">
        기술과 일상,
        <br />
        <span className="relative inline-block">
          TECH & LIFE.
          <span className="bg-acid absolute bottom-[0.08em] left-0 -z-10 h-[0.24em] w-full -rotate-1" />
        </span>
      </h1>
      <p className="text-muted mt-8 max-w-2xl text-lg leading-8 md:text-xl">
        코드를 만지는 나도, 사진을 찍고 취미에 빠지는 나도. 두 로그 사이를 오가며 남긴
        기록.
      </p>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {entries.map(({ href, number, label, title, description, icon: Icon }) => (
          <Link
            className="border-ink/15 bg-surface/60 group relative min-h-80 overflow-hidden rounded-[2rem] border p-7 transition-transform hover:-translate-y-1 md:p-9"
            href={href}
            key={href}
          >
            <div className="flex items-start justify-between">
              <span className="text-orange font-mono text-xs">/{number}</span>
              <span className="border-ink/15 group-hover:bg-acid group-hover:text-acid-ink grid size-12 place-items-center rounded-full border transition-colors">
                <ArrowUpRight aria-hidden="true" size={20} />
              </span>
            </div>
            <Icon aria-hidden="true" className="mt-14" size={30} strokeWidth={1.6} />
            <p className="mt-6 font-mono text-xs font-bold tracking-[0.16em]">{label}</p>
            <h2 className="font-display mt-2 text-3xl font-black tracking-[-0.05em] md:text-4xl">
              {title}
            </h2>
            <p className="text-muted mt-3 max-w-md leading-7">{description}</p>
            <p className="text-muted absolute bottom-8 right-8 font-mono text-[0.65rem]">
              {String(getPostsByChannel(href.slice(1) as "life" | "tech").length).padStart(2, "0")} ENTRIES
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
