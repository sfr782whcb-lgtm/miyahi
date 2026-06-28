import Link from "next/link";
import { Suspense } from "react";
import type { CompanyStatus, SubscriptionPlan } from "@prisma/client";
import CompanyFilters from "@/components/platform/company-filters";
import CompanyPagination from "@/components/platform/company-pagination";
import CompanyRowActions from "@/components/platform/company-row-actions";
import CompanyStatusBadge from "@/components/platform/company-status-badge";
import {
  formatPlatformDate,
  SUBSCRIPTION_PLAN_LABELS,
} from "@/lib/constants/platform";
import { listPlatformCompanies } from "@/lib/queries/platform";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  search?: string;
  status?: CompanyStatus;
  plan?: SubscriptionPlan | "NONE";
  page?: string;
  pageSize?: string;
}>;

export default async function PlatformCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(5, Number(params.pageSize ?? 10) || 10));

  const result = await listPlatformCompanies({
    search: params.search,
    status: params.status,
    plan: params.plan,
    page,
    pageSize,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الشركات</h1>
          <p className="mt-1 text-sm text-slate-500">إنشاء وتعديل وإدارة حسابات الشركات</p>
        </div>
        <Link
          href="/platform/companies/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          شركة جديدة
        </Link>
      </div>

      <Suspense fallback={null}>
        <CompanyFilters />
      </Suspense>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 text-right font-medium">الشركة</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">الخطة</th>
                <th className="px-4 py-3 text-right font-medium">الانتهاء</th>
                <th className="px-4 py-3 text-right font-medium">زبائن</th>
                <th className="px-4 py-3 text-right font-medium">سائقين</th>
                <th className="px-4 py-3 text-right font-medium">طلبات</th>
                <th className="px-4 py-3 text-right font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {result.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    لا توجد شركات مطابقة
                  </td>
                </tr>
              ) : (
                result.items.map((company) => (
                  <tr key={company.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
                      <CompanyStatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {company.subscriptionPlan
                        ? SUBSCRIPTION_PLAN_LABELS[company.subscriptionPlan]
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {company.status === "TRIAL"
                        ? formatPlatformDate(company.trialEndsAt)
                        : formatPlatformDate(company.subscriptionEndsAt)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{company._count.customers}</td>
                    <td className="px-4 py-4 text-slate-600">{company._count.drivers}</td>
                    <td className="px-4 py-4 text-slate-600">{company._count.orders}</td>
                    <td className="px-4 py-4">
                      <CompanyRowActions companyId={company.id} status={company.status} compact />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <Suspense fallback={null}>
            <CompanyPagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
