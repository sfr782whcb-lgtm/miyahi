import Link from "next/link";
import LogoutButton from "@/components/ui/logout-button";
import BottomNav from "@/components/bottom-nav";

const links = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/orders", label: "الطلبات" },
  { href: "/drivers", label: "السائقين" },
  { href: "/customers", label: "الزبائن" },
  { href: "/products", label: "المنتجات" },
  { href: "/reports", label: "التقارير" },
  { href: "/settings", label: "الإعدادات" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col bg-gray-50">
      <aside className="hidden border-b border-emerald-700 bg-emerald-600 md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">مياهي</span>
            <span className="text-sm text-emerald-100">لوحة الإدارة</span>
          </div>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-50 transition-colors hover:bg-white/15"
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </aside>
      {children}
      <BottomNav />
    </div>
  );
}
