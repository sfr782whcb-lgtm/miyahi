import Link from "next/link";
import LogoutButton from "@/components/ui/logout-button";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import { getDashboardData } from "@/lib/queries/orders";

export const dynamic = "force-dynamic";

function StatIcon({ type }: { type: string }) {
  const className = "h-5 w-5 text-emerald-600";
  if (type === "delivered") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
      </svg>
    );
  }
  if (type === "shipping") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
        <path d="M17.25 9h.008v.008H17.25V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM21 9v6.75A2.25 2.25 0 0 1 18.75 18h-1.5a3 3 0 1 1-6 0h-3a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 1 3 15.75V9h18Z" />
      </svg>
    );
  }
  if (type === "revenue") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
        <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75Z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" clipRule="evenodd" />
    </svg>
  );
}

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardData();

  const statCards = [
    { label: "طلبات اليوم", value: String(stats.todayTotal), icon: "orders" },
    { label: "تم التوصيل", value: String(stats.delivered), icon: "delivered" },
    { label: "في الطريق", value: String(stats.inDelivery), icon: "shipping" },
    { label: "الإيراد", value: `${stats.revenue} دينار`, icon: "revenue" },
  ];

  return (
    <>
      <PageHeader
        title="مياهي"
        subtitle="إدارة توصيل قوارير المياه"
        action={<div className="md:hidden"><LogoutButton /></div>}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:pb-8">
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <StatIcon type={stat.icon} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/customers" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            الزبائن
          </Link>
          <Link href="/products" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            المنتجات
          </Link>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">آخر الطلبات</h2>
            <Link href="/orders/new" className="text-sm font-medium text-emerald-600">+ طلب جديد</Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="لا توجد طلبات بعد" action={<Link href="/orders/new" className="text-sm font-medium text-emerald-600">إنشاء طلب</Link>} />
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="mt-1 text-sm text-gray-500">{order.displayId} · {order.bottles} قوارير</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.statusColor}`}>{order.statusLabel}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
