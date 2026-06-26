import type { DriverStatus, OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "جديد",
  PREPARING: "قيد التحضير",
  OUT_FOR_DELIVERY: "في الطريق",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  AVAILABLE: "متاح",
  BUSY: "مشغول",
  OFFLINE: "غير متصل",
};

export const DRIVER_STATUS_COLORS: Record<DriverStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  BUSY: "bg-amber-100 text-amber-700",
  OFFLINE: "bg-gray-100 text-gray-500",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "NEW",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export function formatOrderId(id: string) {
  return `#${id.slice(-4).toUpperCase()}`;
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const inputClassName =
  "block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export const selectClassName = `${inputClassName} cursor-pointer`;

export const buttonPrimaryClassName =
  "cursor-pointer rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-600/30 transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
