"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { resetPasswordAction } from "@/app/actions/auth";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center text-red-700">
        رابط إعادة التعيين غير صالح
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">تعيين كلمة مرور جديدة</h2>
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700">
            كلمة المرور الجديدة
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
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
            minLength={6}
            required
            className={inputClassName}
          />
        </div>
        <button type="submit" disabled={isPending} className={`w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </form>
    </div>
  );
}
