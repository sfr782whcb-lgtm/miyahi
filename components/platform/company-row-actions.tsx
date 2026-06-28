"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { CompanyStatus } from "@prisma/client";
import {
  deletePlatformCompanyAction,
  reactivatePlatformCompanyAction,
  suspendPlatformCompanyAction,
} from "@/app/actions/platform";

export default function CompanyRowActions({
  companyId,
  status,
  compact = false,
}: {
  companyId: string;
  status: CompanyStatus;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | void>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("تم تحديث الشركة");
      router.refresh();
    });
  }

  const buttonClass = compact
    ? "rounded-lg border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
    : "rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-50";

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-4"}`}>
      {status !== "SUSPENDED" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => suspendPlatformCompanyAction(companyId))}
          className={`${buttonClass} border-amber-200 text-amber-700 hover:bg-amber-50`}
        >
          تعليق
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => reactivatePlatformCompanyAction(companyId))}
          className={`${buttonClass} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
        >
          إعادة تفعيل
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("هل تريد حذف الشركة؟ (حذف ناعم)")) return;
          startTransition(async () => {
            const result = await deletePlatformCompanyAction(companyId);
            if (result?.error) toast.error(result.error);
          });
        }}
        className={`${buttonClass} border-rose-200 text-rose-700 hover:bg-rose-50`}
      >
        حذف
      </button>
    </div>
  );
}
