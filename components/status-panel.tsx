import { Activity, Box, Camera, Coffee, Heart, Radio } from "lucide-react";
import type { Channel } from "@/lib/channels";

const panelContent = {
  life: {
    eyebrow: "NOW RECORDING",
    headline: ["Ordinary days,", "kept carefully."],
    statuses: [
      { icon: Coffee, label: "DAILY", value: "하루의 작은 발견" },
      { icon: Heart, label: "HOBBY", value: "오래 좋아하는 것" },
      { icon: Camera, label: "PHOTO", value: "다시 보고 싶은 장면" },
    ],
  },
  tech: {
    eyebrow: "CURRENT BUILD",
    headline: ["One app.", "Observable by default."],
    statuses: [
      { icon: Box, label: "APP", value: "Next.js / React" },
      { icon: Radio, label: "TARGET", value: "Kubernetes / GHCR" },
      { icon: Activity, label: "METRICS", value: "Prometheus ready" },
    ],
  },
} as const;

export function StatusPanel({ channel }: { channel: Channel }) {
  const content = panelContent[channel];

  return (
    <aside className="bg-panel text-panel-ink relative overflow-hidden rounded-[2rem] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.18)] md:p-8">
      <div className="border-panel-ink/10 absolute -right-12 -top-12 size-44 rounded-full border" />
      <div className="border-panel-ink/10 absolute -right-4 -top-4 size-24 rounded-full border" />

      <div className="mb-10 flex items-center justify-between">
        <span className="text-panel-ink/60 font-mono text-xs tracking-[0.16em]">
          {content.eyebrow}
        </span>
        <span className="bg-acid size-2.5 animate-pulse rounded-full" />
      </div>

      <p className="font-display text-3xl font-bold tracking-[-0.05em]">
        {content.headline[0]}
        <br />
        {content.headline[1]}
      </p>

      <dl className="mt-10 space-y-1">
        {content.statuses.map(({ icon: Icon, label, value }) => (
          <div
            className="border-panel-ink/12 grid grid-cols-[1.5rem_4rem_1fr] items-center gap-2 border-t py-3.5"
            key={label}
          >
            <Icon aria-hidden="true" className="text-acid" size={16} />
            <dt className="text-panel-ink/45 font-mono text-[0.65rem] tracking-[0.14em]">
              {label}
            </dt>
            <dd className="text-right text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
