import { requireAdmin } from "@/app/actions/auth";
import AdminLayout from "@/components/layouts/admin-layout";

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}
