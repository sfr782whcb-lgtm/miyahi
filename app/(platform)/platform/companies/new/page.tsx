import Link from "next/link";
import CompanyForm from "@/components/platform/company-form";

export default function NewPlatformCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/platform/companies" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← العودة للشركات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">إنشاء شركة</h1>
        <p className="mt-1 text-sm text-slate-500">إضافة شركة جديدة مع مدير واشتراك</p>
      </div>
      <CompanyForm mode="create" />
    </div>
  );
}
