import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin-dashboard";
import { csrfCookie, sessionCookie, validSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const cookieStore = await cookies();
  const loggedIn = await validSession(cookieStore.get(sessionCookie)?.value);
  return <AdminDashboard initialLoggedIn={loggedIn} initialCsrf={loggedIn ? cookieStore.get(csrfCookie)?.value ?? "" : ""} />;
}
