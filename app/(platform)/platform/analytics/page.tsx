import Link from "next/link";
import CompanyStatusBadge from "@/components/platform/company-status-badge";
import GrowthChart from "@/components/platform/growth-chart";
import PlatformStatCard from "@/components/platform/platform-stat-card";
import {
  formatPlatformCurrency,
} from "@/lib/constants/platform";
import { getPlatformAnalytics, getPlatformCompanyGrowth } from "@/lib/queries/platform";

export const dynamic = "force-dynamic";

export default async function PlatformAnalyticsPage() {
  const [analytics, growth] = await Promise.all([
    getPlatformAnalytics(),
    getPlatformCompanyGrowth(),
  ]);

  const totalOrders = analytics.reduce((sum, row) => sum + row.ordersCount, 0);
  const totalCustomers = analytics.reduce((sum, row) => sum + row.customersCount, 0);
  const totalDrivers = analytics.reduce((sum, row) => sum + row.driversCount, 0);
  const totalRevenue = analytics.reduce((sum, row) => sum + row.monthlyRevenue, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">التحليلات</h1>
        <p className="mt-1 text-sm text-slate-500">مقاييس الأداء لكل شركة على المنصة</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformStatCard label="إجمالي الطلبات" value={totalOrders} />
        <PlatformStatCard label="إجمالي الزبائن" value={totalCustomers} accent="emerald" />
        <PlatformStatCard label="إجمالي السائقين" value={totalDrivers} accent="sky" />
        <PlatformStatCard
          label="إيراد الطلبات (الشهر)"
          value={formatPlatformCurrency(totalRevenue)}
          hint="من الطلبات غير الملغاة"
          accent="indigo"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">أداء الشركات</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-3 py-3 text-right font-medium">الشركة</th>
                  <th className="px-3 py-3 text-right font-medium">الحالة</th>
                  <th className="px-3 py-3 text-right font-medium">طلبات</th>
                  <th className="px-3 py-3 text-right font-medium">زبائن</th>
                  <th className="px-3 py-3 text-right font-medium">سائقين</th>
                  <th className="px-3 py-3 text-right font-medium">إيراد (شهر)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-3">
                      <Link
                        href={`/platform/companies/${row.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {row.name}
                      </Link>
                      <p className="text-xs text-slate-500" dir="ltr">
                        {row.slug}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <CompanyStatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">{row.ordersCount}</td>
                    <td className="px-3 py-3 text-slate-600">{row.customersCount}</td>
                    <td className="px-3 py-3 text-slate-600">{row.driversCount}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {formatPlatformCurrency(row.monthlyRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">نمو الشركات</h2>
          <p className="mb-4 text-sm text-slate-500">شركات جديدة خلال آخر 6 أشهر</p>
          <GrowthChart data={growth} />
        </section>
      </div>
    </div>
  );
}
