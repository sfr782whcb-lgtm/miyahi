import { requireSuperAdmin } from "@/app/actions/auth";
import LogoutButton from "@/components/ui/logout-button";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdmin();

  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">منصة مياهي</p>
            <h1 className="text-lg font-bold text-gray-900">لوحة المالك — {session.name}</h1>
          </div>
          <LogoutButton variant="dark" />
        </div>
      </header>
      {children}
    </div>
  );
}
