import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[65vh] w-full max-w-7xl flex-col items-start justify-center px-5 md:px-8">
      <p className="text-orange font-mono text-sm font-bold">HTTP 404</p>
      <h1 className="font-display mt-4 text-5xl font-black tracking-[-0.06em] md:text-7xl">
        찾는 기록이 없어요.
      </h1>
      <Link className="bg-ink text-paper mt-8 rounded-full px-5 py-3 text-sm font-bold" href="/">
        처음으로
      </Link>
    </section>
  );
}
