"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createDriverAction, updateDriverStatusAction } from "@/app/actions/drivers";
import { buttonPrimaryClassName, inputClassName, selectClassName } from "@/lib/constants";
import { SAUDI_PHONE_MESSAGE } from "@/lib/validations/phone";
import type { DriverStatus } from "@prisma/client";

type Driver = {
  id: string;
  name: string;
  status: DriverStatus;
  statusLabel: string;
  statusColor: string;
  todayOrders: number;
};

export function AddDriverForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createDriverAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("تم إضافة السائق");
      setOpen(false);
      setCreateAccount(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`mt-6 w-full ${buttonPrimaryClassName}`}>
        + إضافة سائق جديد
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">سائق جديد</h3>
      <input name="name" placeholder="اسم السائق" required className={inputClassName} />
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={createAccount}
          onChange={(e) => setCreateAccount(e.target.checked)}
          className="rounded"
        />
        إنشاء حساب دخول للسائق
      </label>
      {createAccount && (
        <>
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
          <input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            minLength={6}
            required
            className={inputClassName}
          />
        </>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {isPending ? "جاري الحفظ..." : "حفظ"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm">إلغاء</button>
      </div>
    </form>
  );
}

export function DriverStatusSelect({ driver }: { driver: Driver }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    const formData = new FormData();
    formData.set("id", driver.id);
    formData.set("status", status);
    startTransition(async () => {
      const result = await updateDriverStatusAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم تحديث حالة السائق");
        router.refresh();
      }
    });
  }

  return (
    <select
      value={driver.status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className={`${selectClassName} !py-1.5 text-xs`}
    >
      <option value="AVAILABLE">متاح</option>
      <option value="BUSY">مشغول</option>
      <option value="OFFLINE">غير متصل</option>
    </select>
  );
}
