import PlatformShell from "@/components/platform/platform-shell";
import { requireSuperAdmin } from "@/app/actions/auth";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdmin();

  return <PlatformShell adminName={session.name}>{children}</PlatformShell>;
}
