"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/app/actions/auth";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";

type LoginFormProps = {
  companySlug: string;
  companyName?: string;
  showCompanySlugField?: boolean;
  registerHref?: string;
  forgotPasswordHref?: string;
};

export default function LoginForm({
  companySlug,
  companyName,
  showCompanySlugField = false,
  registerHref = "/register",
  forgotPasswordHref = "/forgot-password",
}: LoginFormProps) {
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
      <h2 className="mb-2 text-xl font-semibold text-gray-900">تسجيل الدخول</h2>
      {companyName ? (
        <p className="mb-6 text-sm text-gray-500">{companyName}</p>
      ) : (
        <p className="mb-6 text-sm text-gray-500">أدخل بيانات حسابك للمتابعة</p>
      )}
      <form action={handleSubmit} className="space-y-5">
        {showCompanySlugField ? (
          <div>
            <label htmlFor="companySlug" className="mb-2 block text-sm font-medium text-gray-700">
              رمز الشركة
            </label>
            <input
              id="companySlug"
              name="companySlug"
              type="text"
              dir="ltr"
              defaultValue={companySlug}
              placeholder="my-company"
              required
              className={inputClassName}
            />
          </div>
        ) : (
          <input type="hidden" name="companySlug" value={companySlug} />
        )}
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
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="remember" className="rounded" />
          تذكرني لمدة 30 يوماً
        </label>
        <button type="submit" disabled={isPending} className={`mt-2 w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
      <div className="mt-5 space-y-2 text-center text-sm text-gray-600">
        <p>
          <Link href={forgotPasswordHref} className="font-semibold text-emerald-600 hover:text-emerald-700">
            نسيت كلمة المرور؟
          </Link>
        </p>
        <p>
          ليس لديك حساب؟{" "}
          <Link href={registerHref} className="font-semibold text-emerald-600 hover:text-emerald-700">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}
