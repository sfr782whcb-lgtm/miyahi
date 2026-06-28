import AuthShell from "@/components/auth/auth-shell";
import Link from "next/link";
import { redirectToTenantRegisterAction } from "@/app/actions/company";
import { listActiveCompaniesForRegistration } from "@/lib/queries/companies";
import { getTenantRegisterPath } from "@/lib/auth/routes";
import { inputClassName } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const companies = await listActiveCompaniesForRegistration();

  return (
    <AuthShell>
      <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">التسجيل كزبون</h2>
        <p className="mb-6 text-sm text-gray-500">اختر شركتك أو أدخل رمز الشركة</p>

        {companies.length > 0 && (
          <ul className="mb-6 space-y-2">
            {companies.map((company) => (
              <li key={company.slug}>
                <Link
                  href={getTenantRegisterPath(company.slug)}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span className="font-medium text-gray-900">{company.name}</span>
                  <span className="text-gray-400" dir="ltr">
                    {company.slug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form action={redirectToTenantRegisterAction} className="space-y-3">
          <input
            name="slug"
            dir="ltr"
            placeholder="رمز الشركة"
            required
            className={inputClassName}
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            متابعة
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          تمثل شركة مياه؟{" "}
          <Link href="/register/company" className="font-semibold text-emerald-600 hover:text-emerald-700">
            سجّل شركتك
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
