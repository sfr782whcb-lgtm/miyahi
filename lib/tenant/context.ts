import { redirect } from "next/navigation";
import type { SessionPayload } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session";
import { getHomeForRole } from "@/lib/auth/routes";
import { prisma } from "@/lib/prisma";
import {
  canCompanyAccessPlatform,
  getCompanyAccessError,
  resolveEffectiveCompanyStatus,
} from "@/lib/tenant/company";

export type TenantSession = SessionPayload & {
  companyId: string;
  companySlug: string;
};

export async function getTenantSession(): Promise<TenantSession | null> {
  const session = await getSession();
  if (!session?.companyId || !session.companySlug) return null;
  return session as TenantSession;
}

export async function requireTenantSession(): Promise<TenantSession> {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "SUPER_ADMIN") {
    redirect(getHomeForRole(session.role));
  }

  if (!session.companyId || !session.companySlug) {
    redirect("/login");
  }

  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    select: {
      id: true,
      status: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
    },
  });

  if (!company) redirect("/login");

  const effectiveStatus = resolveEffectiveCompanyStatus(company);
  if (!canCompanyAccessPlatform({ ...company, status: effectiveStatus })) {
    redirect(`/login?error=${encodeURIComponent(getCompanyAccessError(effectiveStatus) ?? "company_locked")}`);
  }

  return session as TenantSession;
}

export function tenantFilter(companyId: string) {
  return { companyId };
}
