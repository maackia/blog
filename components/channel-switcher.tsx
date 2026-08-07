"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { channelConfig, channels } from "@/lib/channels";

export function ChannelSwitcher() {
  const pathname = usePathname();
  const activeChannel = channels.find((channel) => pathname.startsWith(`/${channel}`));

  return (
    <nav aria-label="로그 전환" className="border-ink/15 flex rounded-full border bg-white/35 p-1">
      {channels.map((channel) => {
        const isActive = activeChannel === channel;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 font-mono text-[0.65rem] font-bold tracking-[0.08em] transition-colors md:px-4 ${
              isActive ? "bg-ink text-paper" : "text-muted hover:bg-ink/8 hover:text-ink"
            }`}
            href={`/${channel}`}
            key={channel}
          >
            <span className="hidden sm:inline">{channelConfig[channel].label}</span>
            <span className="sm:hidden">{channelConfig[channel].shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
