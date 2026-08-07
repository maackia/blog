import { Activity, Box, Radio } from "lucide-react";

const statuses = [
  { icon: Box, label: "APP", value: "Next.js 16" },
  { icon: Radio, label: "TARGET", value: "K3s / GHCR" },
  { icon: Activity, label: "METRICS", value: "/metrics ready" },
] as const;

export function StatusPanel() {
  return (
    <aside className="bg-ink text-paper relative overflow-hidden rounded-[2rem] p-6 shadow-[0_18px_70px_rgba(24,27,20,0.18)] md:p-8">
      <div className="absolute -right-12 -top-12 size-44 rounded-full border border-white/10" />
      <div className="absolute -right-4 -top-4 size-24 rounded-full border border-white/10" />

      <div className="mb-10 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.16em] text-white/60">
          CURRENT BUILD
        </span>
        <span className="bg-acid size-2.5 animate-pulse rounded-full" />
      </div>

      <p className="font-display text-3xl font-bold tracking-[-0.05em]">
        One app.
        <br />
        Observable by default.
      </p>

      <dl className="mt-10 space-y-1">
        {statuses.map(({ icon: Icon, label, value }) => (
          <div
            className="grid grid-cols-[1.5rem_4rem_1fr] items-center gap-2 border-t border-white/12 py-3.5"
            key={label}
          >
            <Icon aria-hidden="true" className="text-acid" size={16} />
            <dt className="font-mono text-[0.65rem] tracking-[0.14em] text-white/45">
              {label}
            </dt>
            <dd className="text-right text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
