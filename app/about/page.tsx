import { Activity, Boxes, GitBranch } from "lucide-react";

const principles = [
  {
    icon: GitBranch,
    title: "과정을 기록합니다",
    description: "결과만 나열하지 않고 선택, 실패, 수정의 흐름을 함께 남깁니다.",
  },
  {
    icon: Boxes,
    title: "작게 배포합니다",
    description: "완벽해질 때까지 기다리지 않고 관찰 가능한 작은 단위로 운영합니다.",
  },
  {
    icon: Activity,
    title: "측정하며 이해합니다",
    description: "느낌 대신 메트릭, 로그, 트레이스로 시스템의 상태를 확인합니다.",
  },
] as const;

export const metadata = {
  title: "About",
  description: "MAACKIA.LOG와 이곳에 기록하는 주제를 소개합니다.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-orange font-mono text-xs font-bold tracking-[0.16em]">ABOUT THIS LOG</p>
      <h1 className="font-display mt-4 max-w-4xl text-5xl font-black leading-[1] tracking-[-0.06em] md:text-7xl">
        운영해 본 것만큼
        <br />
        정확한 문서는 없습니다.
      </h1>
      <p className="text-muted mt-8 max-w-2xl text-lg leading-8">
        MAACKIA.LOG는 React 애플리케이션을 만들고 컨테이너로 패키징해
        Kubernetes에 배포하는 전 과정을 기록하는 개인 엔지니어링 노트입니다.
      </p>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {principles.map(({ icon: Icon, title, description }, index) => (
          <article className="border-ink/15 rounded-3xl border bg-white/30 p-6" key={title}>
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
