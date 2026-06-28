import { redirect } from "next/navigation";
import { getHomeForRole } from "@/lib/auth/routes";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(getHomeForRole(session.role));
  }
  redirect("/login");
}
