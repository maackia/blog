import { Info } from "lucide-react";
import Link from "next/link";
import { ChannelSwitcher } from "@/components/channel-switcher";

export function SiteHeader() {
  return (
    <header className="border-ink/15 bg-paper/90 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          className="group flex items-center gap-3 font-mono text-sm font-bold tracking-[0.14em]"
          href="/"
        >
          <span className="bg-acid text-ink grid size-8 place-items-center rounded-full transition-transform group-hover:-rotate-6">
            M
          </span>
          <span className="hidden sm:inline">MAACKIA.LOG</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <ChannelSwitcher />
          <Link
            aria-label="블로그 소개"
            className="hover:bg-ink hover:text-paper grid size-9 place-items-center rounded-full text-sm font-semibold transition-colors md:flex md:w-auto md:px-4"
            href="/about"
          >
            <Info aria-hidden="true" className="md:hidden" size={17} />
            <span className="hidden md:inline">소개</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
