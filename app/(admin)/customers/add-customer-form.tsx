"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createCustomerAction } from "@/app/actions/customers";
import { buttonPrimaryClassName, inputClassName } from "@/lib/constants";

export default function AddCustomerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createCustomerAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم إضافة الزبون");
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mb-6 space-y-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">إضافة زبون</h3>
      <input name="name" placeholder="الاسم" required className={inputClassName} />
      <input name="phone" placeholder="رقم الهاتف" dir="ltr" required className={inputClassName} />
      <input name="address" placeholder="العنوان" className={inputClassName} />
      <input name="area" placeholder="المنطقة" className={inputClassName} />
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" name="createAccount" className="rounded" />
        إنشاء حساب دخول
      </label>
      <input name="password" type="password" placeholder="كلمة المرور للحساب" className={inputClassName} />
      <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
        {isPending ? "جاري الحفظ..." : "حفظ الزبون"}
      </button>
    </form>
  );
}
