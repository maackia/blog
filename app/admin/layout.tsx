import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "관리자", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get("host");
  if (!process.env.BLOG_TAILSCALE_IP || host !== process.env.BLOG_TAILSCALE_IP) notFound();
  return <>{children}</>;
}
