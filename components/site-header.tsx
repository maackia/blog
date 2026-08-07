import Link from "next/link";

const navigation = [
  { href: "/", label: "Notes" },
  { href: "/tags/kubernetes", label: "Kubernetes" },
  { href: "/about", label: "About" },
] as const;

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
          MAACKIA.LOG
        </Link>

        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-1 text-sm font-semibold md:gap-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  className="hover:bg-ink hover:text-paper rounded-full px-3 py-2 transition-colors md:px-4"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
