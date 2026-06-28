import Link from "next/link";
import { notFound } from "next/navigation";
import { toDateInputValue } from "@/lib/constants/platform";
import CompanyForm from "@/components/platform/company-form";
import CompanyRowActions from "@/components/platform/company-row-actions";
import CompanyStatusBadge from "@/components/platform/company-status-badge";
import {
  formatPlatformDate,
  SUBSCRIPTION_PLAN_LABELS,
} from "@/lib/constants/platform";
import { getPlatformCompany } from "@/lib/queries/platform";

export const dynamic = "force-dynamic";

export default async function PlatformCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getPlatformCompany(id);

  if (!company || company.deletedAt) {
    notFound();
  }

  const admin = company.users[0];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/platform/companies" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← العودة للشركات
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
            <p className="mt-1 text-sm text-slate-500" dir="ltr">
              {company.slug}
            </p>
          </div>
          <CompanyStatusBadge status={company.status} />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "الزبائن", value: company._count.customers },
          { label: "السائقين", value: company._count.drivers },
          { label: "الطلبات", value: company._count.orders },
          { label: "المنتجات", value: company._count.products },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">معلومات الاشتراك</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">الخطة</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {company.subscriptionPlan
                ? SUBSCRIPTION_PLAN_LABELS[company.subscriptionPlan]
                : "بدون خطة"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">نهاية التجربة</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatPlatformDate(company.trialEndsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">انتهاء الاشتراك</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatPlatformDate(company.subscriptionEndsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">تاريخ الإنشاء</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatPlatformDate(company.createdAt)}
            </dd>
          </div>
          {admin ? (
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">مدير الشركة</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {admin.name} — <span dir="ltr">{admin.phone}</span>
              </dd>
            </div>
          ) : null}
        </dl>
        <CompanyRowActions companyId={company.id} status={company.status} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">تعديل الشركة</h2>
        <CompanyForm
          mode="edit"
          companyId={company.id}
          initial={{
            name: company.name,
            slug: company.slug,
            phone: company.phone ?? undefined,
            address: company.address ?? undefined,
            primaryColor: company.primaryColor,
            status: company.status,
            subscriptionPlan: company.subscriptionPlan,
            trialEndsAt: toDateInputValue(company.trialEndsAt),
            subscriptionEndsAt: toDateInputValue(company.subscriptionEndsAt),
          }}
        />
      </section>
    </div>
  );
}
