"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { registerAction } from "@/app/actions/auth";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">إنشاء حساب</h2>
      <p className="mb-6 text-sm text-gray-500">سجّل كزبون لطلب قوارير المياه</p>
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="companySlug" value="default" />
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            الاسم
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
            رقم الهاتف
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            placeholder="05XXXXXXXX"
            pattern="05[0-9]{8}"
            title={SAUDI_PHONE_MESSAGE}
            autoComplete="tel"
            required
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-gray-500">{SAUDI_PHONE_MESSAGE}</p>
        </div>
        <input name="address" placeholder="العنوان (اختياري)" className={inputClassName} />
        <input name="area" placeholder="المنطقة (اختياري)" className={inputClassName} />
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className={inputClassName}
          />
        </div>
        <button type="submit" disabled={isPending} className={`mt-2 w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-600">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
