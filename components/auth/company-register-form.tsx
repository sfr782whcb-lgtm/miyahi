"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { registerCompanyAction } from "@/app/actions/company";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";
import { slugifyCompanyName } from "@/lib/validations/slug";

export default function CompanyRegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await registerCompanyAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">تسجيل شركة جديدة</h2>
      <p className="mb-6 text-sm text-gray-500">
        أنشئ مساحة عمل لشركة المياه الخاصة بك — تجربة مجانية 14 يوماً
      </p>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-gray-700">
            اسم الشركة
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            minLength={2}
            className={inputClassName}
            onChange={(e) => {
              if (!slug) setSlug(slugifyCompanyName(e.target.value));
            }}
          />
        </div>
        <div>
          <label htmlFor="companySlug" className="mb-2 block text-sm font-medium text-gray-700">
            رمز الشركة (للروابط)
          </label>
          <input
            id="companySlug"
            name="companySlug"
            dir="ltr"
            required
            minLength={3}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="my-water-company"
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-gray-500" dir="ltr">
            miyyahi.app/c/{slug || "your-company"}/login
          </p>
        </div>
        <input name="companyPhone" placeholder="هاتف الشركة (اختياري)" className={inputClassName} />
        <input name="address" placeholder="عنوان الشركة (اختياري)" className={inputClassName} />
        <div>
          <label htmlFor="adminName" className="mb-2 block text-sm font-medium text-gray-700">
            اسم مدير الحساب
          </label>
          <input id="adminName" name="adminName" required minLength={2} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
            رقم هاتف المدير
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            pattern="05[0-9]{8}"
            title={SAUDI_PHONE_MESSAGE}
            required
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            كلمة المرور
          </label>
          <input id="password" name="password" type="password" minLength={6} required className={inputClassName} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            className={inputClassName}
          />
        </div>
        <button type="submit" disabled={isPending} className={`mt-2 w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري إنشاء الشركة..." : "إنشاء الشركة"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-600">
        لديك حساب؟{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
