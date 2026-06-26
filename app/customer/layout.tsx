import { requireCustomer } from "@/app/actions/auth";
import LogoutButton from "@/components/ui/logout-button";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomer();

  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col bg-gray-50">
      <header className="bg-emerald-600 px-4 py-4 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm text-emerald-100">بوابة الزبون</p>
            <h1 className="text-lg font-bold text-white">{session.name}</h1>
          </div>
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
