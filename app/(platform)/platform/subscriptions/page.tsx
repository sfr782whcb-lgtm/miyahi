import Link from "next/link";
import CompanyStatusBadge from "@/components/platform/company-status-badge";
import PlatformStatCard from "@/components/platform/platform-stat-card";
import {
  formatPlatformCurrency,
  formatPlatformDate,
  SUBSCRIPTION_PLAN_LABELS,
} from "@/lib/constants/platform";
import { getPlatformSubscriptionOverview } from "@/lib/queries/platform";

export const dynamic = "force-dynamic";

export default async function PlatformSubscriptionsPage() {
  const overview = await getPlatformSubscriptionOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الاشتراكات</h1>
        <p className="mt-1 text-sm text-slate-500">
          حالة الاشتراكات والخطط والتجديدات القادمة
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PlatformStatCard label="تجريبي" value={overview.trial} accent="sky" />
        <PlatformStatCard label="نشط" value={overview.active} accent="emerald" />
        <PlatformStatCard label="منتهي" value={overview.expired} accent="rose" />
        <PlatformStatCard label="موقوف" value={overview.suspended} accent="amber" />
        <PlatformStatCard label="خطة شهرية" value={overview.monthly} accent="indigo" />
        <PlatformStatCard label="خطة سنوية" value={overview.yearly} accent="indigo" />
      </div>

      <PlatformStatCard
        label="الإيراد الشهري المتكرر (تقديري)"
        value={formatPlatformCurrency(Math.round(overview.placeholderMrr))}
        hint="99 ر.س/شهري — 990 ر.س/سنوي (تقديري)"
        accent="indigo"
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">اشتراكات تنتهي خلال 30 يوماً</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-3 py-3 text-right font-medium">الشركة</th>
                <th className="px-3 py-3 text-right font-medium">الحالة</th>
                <th className="px-3 py-3 text-right font-medium">الخطة</th>
                <th className="px-3 py-3 text-right font-medium">تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody>
              {overview.expiringSoon.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    لا توجد اشتراكات تنتهي قريباً
                  </td>
                </tr>
              ) : (
                overview.expiringSoon.map((company) => (
                  <tr key={company.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-3">
                      <Link
                        href={`/platform/companies/${company.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <CompanyStatusBadge status={company.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {company.subscriptionPlan
                        ? SUBSCRIPTION_PLAN_LABELS[company.subscriptionPlan]
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {formatPlatformDate(company.subscriptionEndsAt ?? company.trialEndsAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
