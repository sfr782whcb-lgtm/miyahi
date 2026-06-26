"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCustomerAction } from "@/app/actions/customers";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";

export default function AddCustomerForm() {
  const router = useRouter();
  const [createAccount, setCreateAccount] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createCustomerAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم إضافة الزبون");
        setCreateAccount(false);
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mb-6 space-y-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">إضافة زبون</h3>
      <input name="name" placeholder="الاسم" required className={inputClassName} />
      <div>
        <input
          name="phone"
          type="tel"
          placeholder="05XXXXXXXX"
          dir="ltr"
          pattern="05[0-9]{8}"
          title={SAUDI_PHONE_MESSAGE}
          required
          className={inputClassName}
        />
        <p className="mt-1 text-xs text-gray-500">{SAUDI_PHONE_MESSAGE}</p>
      </div>
      <input name="address" placeholder="العنوان" className={inputClassName} />
      <input name="area" placeholder="المنطقة" className={inputClassName} />
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          name="createAccount"
          checked={createAccount}
          onChange={(e) => setCreateAccount(e.target.checked)}
          className="rounded"
        />
        إنشاء حساب دخول للزبون
      </label>
      {createAccount && (
        <input
          name="password"
          type="password"
          placeholder="كلمة المرور للحساب"
          minLength={6}
          required
          className={inputClassName}
        />
      )}
      <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
        {isPending ? "جاري الحفظ..." : "حفظ الزبون"}
      </button>
    </form>
  );
}
