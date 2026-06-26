"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/app/actions/orders";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  selectClassName,
} from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";

type Order = {
  id: string;
  displayId: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  bottles: number;
  bottleSize: number;
  status: OrderStatus;
  statusLabel: string;
  statusColor: string;
  driverName: string | null;
  productName: string | null;
  price: number;
};

export default function OrderCard({
  order,
  showStatusControl = true,
}: {
  order: Order;
  showStatusControl?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("status", status);
    startTransition(async () => {
      const result = await updateOrderStatusAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم تحديث حالة الطلب");
        router.refresh();
      }
    });
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">{order.customerName}</p>
          <p className="mt-1 text-sm text-gray-500">
            {order.displayId} · {order.bottles} × {order.bottleSize} لتر
            {order.productName ? ` (${order.productName})` : ""}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {order.area} — {order.address}
          </p>
          <p className="mt-1 text-sm text-gray-500" dir="ltr">
            {order.phone}
          </p>
          {order.driverName && (
            <p className="mt-1 text-sm text-emerald-600">السائق: {order.driverName}</p>
          )}
          <p className="mt-1 text-sm font-medium text-gray-700">{order.price} دينار</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.statusColor}`}>
            {order.statusLabel}
          </span>
          {showStatusControl && (
            <select
              value={order.status}
              disabled={isPending}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`${selectClassName} !py-2 text-sm`}
            >
              {ORDER_STATUS_FLOW.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
