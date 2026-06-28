"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/app/actions/auth";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";

type ForgotPasswordFormProps = {
  defaultCompanySlug?: string;
};

export default function ForgotPasswordForm({
  defaultCompanySlug = "",
}: ForgotPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await forgotPasswordAction(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSubmitted(true);
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
      }
      toast.success("إذا كان الحساب موجوداً، تم إنشاء رابط إعادة التعيين");
    });
  }

  if (submitted) {
    return (
      <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">تحقق من الرابط</h2>
        <p className="text-sm text-gray-600">
          إذا كان رقم الهاتف مسجلاً لدينا، يمكنك إعادة تعيين كلمة المرور.
        </p>
        {resetUrl && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <p className="mb-2 font-medium">وضع التطوير — رابط إعادة التعيين:</p>
            <Link href={resetUrl} className="break-all text-emerald-700 underline" dir="ltr">
              {resetUrl}
            </Link>
          </div>
        )}
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-emerald-600">
          العودة لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">نسيت كلمة المرور</h2>
      <p className="mb-6 text-sm text-gray-500">أدخل رمز الشركة ورقم الهاتف المسجل</p>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companySlug" className="mb-2 block text-sm font-medium text-gray-700">
            رمز الشركة
          </label>
          <input
            id="companySlug"
            name="companySlug"
            dir="ltr"
            defaultValue={defaultCompanySlug}
            required
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
            pattern="05[0-9]{8}"
            title={SAUDI_PHONE_MESSAGE}
            required
            className={inputClassName}
          />
        </div>
        <button type="submit" disabled={isPending} className={`w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-600">
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
