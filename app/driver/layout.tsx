import { requireDriver } from "@/app/actions/auth";
import LogoutButton from "@/components/ui/logout-button";
import PushNotificationPrompt from "@/components/notifications/push-notification-prompt";
import Link from "next/link";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireDriver();

  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col bg-gray-50">
      <PushNotificationPrompt />
      <header className="bg-emerald-600 px-4 py-4 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm text-emerald-100">بوابة السائق</p>
            <h1 className="text-lg font-bold text-white">{session.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/driver/settings"
              className="rounded-lg px-3 py-1.5 text-sm text-emerald-100 transition-colors hover:bg-white/15"
            >
              الإعدادات
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
