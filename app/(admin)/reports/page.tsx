import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import { requireAdmin } from "@/app/actions/auth";
import { getReportsData } from "@/lib/queries/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await requireAdmin();
  const { monthStats, topAreas, bestDriver } = await getReportsData(session.companyId);

  return (
    <>
      <PageHeader title="التقارير" subtitle="تقرير الشهر الحالي" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:pb-8">
        <section className="mb-6 grid grid-cols-2 gap-3 lg:max-w-xl">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{monthStats.totalOrders}</p>
            <p className="mt-1 text-sm text-gray-500">إجمالي الطلبات</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{monthStats.revenue} دينار</p>
            <p className="mt-1 text-sm text-gray-500">الإيرادات</p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">أكثر المناطق طلباً</h2>
          {topAreas.length === 0 ? (
            <EmptyState title="لا توجد بيانات" />
          ) : (
            <div className="space-y-3">
              {topAreas.map((area, index) => (
                <div key={area.name} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{index + 1}</span>
                    <p className="font-medium text-gray-900">{area.name}</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">{area.orders} طلب</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">أفضل سائق الشهر</h2>
          {bestDriver ? (
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-white p-5 shadow-sm">
              <p className="text-lg font-bold text-gray-900">{bestDriver.name}</p>
              <p className="mt-1 text-sm text-gray-500">{bestDriver.count} طلب مكتمل</p>
            </div>
          ) : (
            <EmptyState title="لا توجد طلبات مكتملة هذا الشهر" />
          )}
        </section>
      </main>
    </>
  );
}
