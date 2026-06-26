"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { driverUpdateOrderStatusAction } from "@/app/actions/orders";
import { buttonPrimaryClassName } from "@/lib/constants";

type Order = {
  id: string;
  displayId: string;
  customerName: string;
  address: string;
  area: string;
  phone: string;
  bottles: number;
  statusLabel: string;
  statusColor: string;
  status: string;
};

export default function DriverOrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markDelivered() {
    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("status", "DELIVERED");
    startTransition(async () => {
      const result = await driverUpdateOrderStatusAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم تأكيد التوصيل");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900">{order.customerName}</p>
          <p className="mt-1 text-sm text-gray-500">{order.displayId} · {order.bottles} قوارير</p>
          <p className="mt-1 text-sm text-gray-500">{order.area} — {order.address}</p>
          <p className="mt-1 text-sm text-gray-500" dir="ltr">{order.phone}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.statusColor}`}>{order.statusLabel}</span>
      </div>
      {order.status === "OUT_FOR_DELIVERY" && (
        <button type="button" disabled={isPending} onClick={markDelivered} className={`mt-4 w-full ${buttonPrimaryClassName}`}>
          {isPending ? "جاري التحديث..." : "تأكيد التوصيل"}
        </button>
      )}
    </div>
  );
}
