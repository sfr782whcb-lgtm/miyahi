"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/app/actions/auth";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">تسجيل الدخول</h2>
      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="companySlug" value="default" />
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
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            minLength={6}
            required
            className={inputClassName}
          />
        </div>
        <button type="submit" disabled={isPending} className={`mt-2 w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-600">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  );
}
