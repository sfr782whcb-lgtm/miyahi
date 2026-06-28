import type { Company, CompanyStatus } from "@prisma/client";

export function isCompanyOperational(company: Pick<Company, "status">): boolean {
  return company.status === "ACTIVE" || company.status === "TRIAL";
}

export function isCompanyTrialExpired(company: Pick<Company, "trialEndsAt" | "status">): boolean {
  if (company.status !== "TRIAL" || !company.trialEndsAt) return false;
  return company.trialEndsAt.getTime() < Date.now();
}

export function isCompanySubscriptionExpired(
  company: Pick<Company, "subscriptionEndsAt" | "status">,
): boolean {
  if (company.status !== "ACTIVE" || !company.subscriptionEndsAt) return false;
  return company.subscriptionEndsAt.getTime() < Date.now();
}

export function getCompanyAccessError(status: CompanyStatus): string | null {
  switch (status) {
    case "SUSPENDED":
      return "تم تعليق حساب الشركة. تواصل مع الدعم.";
    case "EXPIRED":
      return "انتهى اشتراك الشركة. يرجى التجديد.";
    default:
      return null;
  }
}

export function resolveEffectiveCompanyStatus(
  company: Pick<Company, "status" | "trialEndsAt" | "subscriptionEndsAt">,
): CompanyStatus {
  if (company.status === "TRIAL" && isCompanyTrialExpired(company)) {
    return "EXPIRED";
  }
  if (company.status === "ACTIVE" && isCompanySubscriptionExpired(company)) {
    return "EXPIRED";
  }
  return company.status;
}

export function canCompanyAccessPlatform(
  company: Pick<Company, "status" | "trialEndsAt" | "subscriptionEndsAt">,
): boolean {
  const effectiveStatus = resolveEffectiveCompanyStatus(company);
  return effectiveStatus === "ACTIVE" || effectiveStatus === "TRIAL";
}
