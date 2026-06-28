"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { CompanyStatus, SubscriptionPlan } from "@prisma/client";
import {
  createPlatformCompanyAction,
  updatePlatformCompanyAction,
} from "@/app/actions/platform";
import { buttonPrimaryClassName, inputClassName, selectClassName } from "@/lib/constants";

type CompanyFormValues = {
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
  status: CompanyStatus;
  subscriptionPlan?: SubscriptionPlan | null;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  adminName?: string;
  adminPhone?: string;
};

export default function CompanyForm({
  mode,
  companyId,
  initial,
}: {
  mode: "create" | "edit";
  companyId?: string;
  initial?: CompanyFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPlatformCompanyAction(formData)
          : await updatePlatformCompanyAction(companyId!, formData);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">بيانات الشركة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              اسم الشركة
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={initial?.name}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-700">
              رمز الشركة
            </label>
            <input
              id="slug"
              name="slug"
              dir="ltr"
              required
              defaultValue={initial?.slug}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
              هاتف الشركة
            </label>
            <input id="phone" name="phone" defaultValue={initial?.phone} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="primaryColor" className="mb-2 block text-sm font-medium text-slate-700">
              اللون الأساسي
            </label>
            <input
              id="primaryColor"
              name="primaryColor"
              dir="ltr"
              defaultValue={initial?.primaryColor ?? "#059669"}
              className={inputClassName}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
              العنوان
            </label>
            <input
              id="address"
              name="address"
              defaultValue={initial?.address}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">الاشتراك</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
              حالة الشركة
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "TRIAL"}
              className={selectClassName}
            >
              <option value="TRIAL">تجريبي</option>
              <option value="ACTIVE">نشط</option>
              <option value="SUSPENDED">موقوف</option>
              <option value="EXPIRED">منتهي</option>
            </select>
          </div>
          <div>
            <label htmlFor="subscriptionPlan" className="mb-2 block text-sm font-medium text-slate-700">
              خطة الاشتراك
            </label>
            <select
              id="subscriptionPlan"
              name="subscriptionPlan"
              defaultValue={initial?.subscriptionPlan ?? ""}
              className={selectClassName}
            >
              <option value="">بدون خطة</option>
              <option value="MONTHLY">شهري</option>
              <option value="YEARLY">سنوي</option>
            </select>
          </div>
          <div>
            <label htmlFor="trialEndsAt" className="mb-2 block text-sm font-medium text-slate-700">
              نهاية التجربة
            </label>
            <input
              id="trialEndsAt"
              name="trialEndsAt"
              type="date"
              dir="ltr"
              defaultValue={initial?.trialEndsAt}
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor="subscriptionEndsAt"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              تاريخ انتهاء الاشتراك
            </label>
            <input
              id="subscriptionEndsAt"
              name="subscriptionEndsAt"
              type="date"
              dir="ltr"
              defaultValue={initial?.subscriptionEndsAt}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      {mode === "create" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">مدير الشركة</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="adminName" className="mb-2 block text-sm font-medium text-slate-700">
                اسم المدير
              </label>
              <input id="adminName" name="adminName" required className={inputClassName} />
            </div>
            <div>
              <label htmlFor="adminPhone" className="mb-2 block text-sm font-medium text-slate-700">
                هاتف المدير
              </label>
              <input
                id="adminPhone"
                name="adminPhone"
                required
                placeholder="05XXXXXXXX"
                className={inputClassName}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="adminPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                كلمة مرور المدير
              </label>
              <input
                id="adminPassword"
                name="adminPassword"
                type="password"
                required
                minLength={6}
                className={inputClassName}
              />
            </div>
          </div>
        </section>
      ) : null}

      <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
        {isPending ? "جاري الحفظ..." : mode === "create" ? "إنشاء الشركة" : "حفظ التعديلات"}
      </button>
    </form>
  );
}
