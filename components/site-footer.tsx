export function SiteFooter() {
  return (
    <footer className="border-ink/15 mt-20 border-t">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-mono">© {new Date().getFullYear()} MAACKIA.LOG</p>
        <p className="text-muted">기술도 일상도, 결국 내가 남긴 기록.</p>
      </div>
    </footer>
  );
}
