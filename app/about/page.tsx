import { Camera, Layers3, TerminalSquare } from "lucide-react";

const principles = [
  {
    icon: Camera,
    title: "LIFE LOG",
    description: "금방 지나갈 하루, 오래 좋아한 취미, 다시 보고 싶은 사진.",
  },
  {
    icon: TerminalSquare,
    title: "TECH LOG",
    description: "직접 만들고 배포하고 운영하며 남긴 선택과 실패.",
  },
  {
    icon: Layers3,
    title: "ONE ARCHIVE",
    description: "서로 다른 두 관심사, 결국 한 사람의 기록.",
  },
] as const;

export const metadata = {
  title: "소개",
  description: "일상과 기술, 한 사람에게서 나온 두 개의 로그.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-orange font-mono text-xs font-bold tracking-[0.16em]">
        ABOUT THIS JOURNAL
      </p>
      <h1 className="font-display mt-4 max-w-4xl text-5xl font-black leading-[1] tracking-[-0.06em] md:text-7xl">
        만드는 나도,
        <br />
        살아가는 나도.
      </h1>
      <p className="text-muted mt-8 max-w-2xl text-lg leading-8">
        TECH LOG에는 만들고 운영하며 배운 것을, LIFE LOG에는 일상과 취미와 사진을
        남긴다. 서로 다른 두 로그지만 모두 같은 사람의 기록이다.
      </p>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {principles.map(({ icon: Icon, title, description }, index) => (
          <article
            className="border-ink/15 bg-surface/55 rounded-3xl border p-6"
            key={title}
          >
            <div className="flex items-center justify-between">
              <Icon aria-hidden="true" size={22} />
              <span className="text-muted font-mono text-xs">0{index + 1}</span>
            </div>
            <h2 className="font-display mt-12 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
            <p className="text-muted mt-3 leading-7">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
