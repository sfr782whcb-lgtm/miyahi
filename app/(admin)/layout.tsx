import { requireAdmin } from "@/app/actions/auth";
import AdminLayout from "@/components/layouts/admin-layout";
import PushNotificationPrompt from "@/components/notifications/push-notification-prompt";

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <>
      <PushNotificationPrompt />
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}
