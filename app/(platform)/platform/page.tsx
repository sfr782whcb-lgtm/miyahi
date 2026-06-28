import Link from "next/link";
import CompanyStatusBadge from "@/components/platform/company-status-badge";
import PlatformStatCard from "@/components/platform/platform-stat-card";
import {
  formatPlatformCurrency,
  formatPlatformDate,
  SUBSCRIPTION_PLAN_LABELS,
} from "@/lib/constants/platform";
import { getPlatformDashboardStats } from "@/lib/queries/platform";

export const dynamic = "force-dynamic";

export default async function PlatformDashboardPage() {
  const stats = await getPlatformDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">نظرة عامة</h1>
          <p className="mt-1 text-sm text-slate-500">
            إحصائيات المنصة والشركات المسجلة
          </p>
        </div>
        <Link
          href="/platform/companies/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          إنشاء شركة
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformStatCard label="إجمالي الشركات" value={stats.totalCompanies} />
        <PlatformStatCard label="شركات نشطة" value={stats.activeCompanies} accent="emerald" />
        <PlatformStatCard label="شركات موقوفة" value={stats.suspendedCompanies} accent="amber" />
        <PlatformStatCard label="شركات تجريبية" value={stats.trialCompanies} accent="sky" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformStatCard
          label="الإيراد الشهري (تقديري)"
          value={formatPlatformCurrency(Math.round(stats.monthlySubscriptionRevenue))}
          hint="قيمة تقديرية للاشتراكات"
          accent="indigo"
        />
        <PlatformStatCard label="إجمالي الزبائن" value={stats.totalCustomers} accent="emerald" />
        <PlatformStatCard label="إجمالي السائقين" value={stats.totalDrivers} accent="sky" />
        <PlatformStatCard label="إجمالي الطلبات" value={stats.totalOrders} accent="rose" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">أحدث الشركات</h2>
          <Link href="/platform/companies" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            عرض الكل
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-3 py-3 text-right font-medium">الشركة</th>
                <th className="px-3 py-3 text-right font-medium">الحالة</th>
                <th className="px-3 py-3 text-right font-medium">الخطة</th>
                <th className="px-3 py-3 text-right font-medium">الزبائن</th>
                <th className="px-3 py-3 text-right font-medium">الطلبات</th>
                <th className="px-3 py-3 text-right font-medium">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCompanies.map((company) => (
                <tr key={company.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-3">
                    <Link
                      href={`/platform/companies/${company.id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {company.name}
                    </Link>
                    <p className="text-xs text-slate-500" dir="ltr">
                      {company.slug}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <CompanyStatusBadge status={company.status} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {company.subscriptionPlan
                      ? SUBSCRIPTION_PLAN_LABELS[company.subscriptionPlan]
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{company._count.customers}</td>
                  <td className="px-3 py-3 text-slate-600">{company._count.orders}</td>
                  <td className="px-3 py-3 text-slate-600">{formatPlatformDate(company.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
