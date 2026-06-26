"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/app/actions/auth";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("تم تغيير كلمة المرور بنجاح");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="currentPassword" className="mb-2 block text-sm font-medium text-gray-700">
          كلمة المرور الحالية
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700">
          كلمة المرور الجديدة
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
          تأكيد كلمة المرور الجديدة
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
      <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
        {isPending ? "جاري الحفظ..." : "تغيير كلمة المرور"}
      </button>
    </form>
  );
}
