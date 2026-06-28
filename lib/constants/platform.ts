import type { CompanyStatus, SubscriptionPlan } from "@prisma/client";

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  TRIAL: "تجريبي",
  ACTIVE: "نشط",
  SUSPENDED: "موقوف",
  EXPIRED: "منتهي",
};

export const COMPANY_STATUS_COLORS: Record<CompanyStatus, string> = {
  TRIAL: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  EXPIRED: "bg-red-100 text-red-700",
};

export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  MONTHLY: "شهري",
  YEARLY: "سنوي",
};

export const SUBSCRIPTION_PLAN_PRICES: Record<SubscriptionPlan, number> = {
  MONTHLY: 99,
  YEARLY: 990,
};

export const PLATFORM_PAGE_SIZE = 10;

export const PLATFORM_NAV = [
  { href: "/platform", label: "نظرة عامة", exact: true },
  { href: "/platform/companies", label: "الشركات" },
  { href: "/platform/subscriptions", label: "الاشتراكات" },
  { href: "/platform/analytics", label: "التحليلات" },
] as const;

export function formatPlatformCurrency(amount: number) {
  return `${amount.toLocaleString("ar-SA")} ر.س`;
}

export function formatPlatformDate(date: Date | null | undefined) {
  if (!date) return "—";
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function computePlaceholderMrr(
  monthlyCount: number,
  yearlyCount: number,
): number {
  return (
    monthlyCount * SUBSCRIPTION_PLAN_PRICES.MONTHLY +
    yearlyCount * (SUBSCRIPTION_PLAN_PRICES.YEARLY / 12)
  );
}
