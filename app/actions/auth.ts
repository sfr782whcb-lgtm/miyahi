"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { getHomeForRole } from "@/lib/auth/routes";
import {
  getUserPasswordHash,
  updateUserPassword,
} from "@/lib/queries/users";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validations/schemas";
import { getUniqueConstraintMessage } from "@/lib/prisma-errors";
import { registerCustomer } from "@/lib/queries/customers";
import type { UserRole } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth/session";
import {
  canCompanyAccessPlatform,
  getCompanyAccessError,
  resolveEffectiveCompanyStatus,
} from "@/lib/tenant/company";

const DEFAULT_COMPANY_SLUG = "default";

async function findLoginUser(phone: string, companySlug: string) {
  if (companySlug === "platform") {
    return prisma.user.findFirst({
      where: { phone, role: "SUPER_ADMIN" },
      include: { driver: true, customer: true, company: true },
    });
  }

  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });

  if (!company) return null;

  const user = await prisma.user.findUnique({
    where: {
      companyId_phone: {
        companyId: company.id,
        phone,
      },
    },
    include: { driver: true, customer: true, company: true },
  });

  return user ? { ...user, company } : null;
}

function buildSessionFromUser(user: {
  id: string;
  role: UserRole;
  name: string;
  companyId: string | null;
  company?: { slug: string } | null;
  driver?: { id: string } | null;
  customer?: { id: string } | null;
}) {
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    companyId: user.companyId ?? undefined,
    companySlug: user.company?.slug,
    driverId: user.driver?.id,
    customerId: user.customer?.id,
  };
}

export async function loginAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
    companySlug: formData.get("companySlug") || DEFAULT_COMPANY_SLUG,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const companySlug = parsed.data.companySlug || DEFAULT_COMPANY_SLUG;
  const user = await findLoginUser(parsed.data.phone, companySlug);

  if (!user) {
    return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
  }

  if (user.role !== "SUPER_ADMIN" && user.company) {
    const effectiveStatus = resolveEffectiveCompanyStatus(user.company);
    if (!canCompanyAccessPlatform({ ...user.company, status: effectiveStatus })) {
      return {
        error: getCompanyAccessError(effectiveStatus) ?? "لا يمكن الوصول إلى حساب الشركة",
      };
    }
  }

  await createSession(buildSessionFromUser(user));
  redirect(getHomeForRole(user.role));
}

export async function registerAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const companySlug =
    String(formData.get("companySlug") ?? "").trim() || DEFAULT_COMPANY_SLUG;

  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });

  if (!company) {
    return { error: "الشركة غير موجودة" };
  }

  const effectiveStatus = resolveEffectiveCompanyStatus(company);
  if (!canCompanyAccessPlatform({ ...company, status: effectiveStatus })) {
    return {
      error: getCompanyAccessError(effectiveStatus) ?? "التسجيل غير متاح لهذه الشركة",
    };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    address: formData.get("address") || undefined,
    area: formData.get("area") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  let result;
  try {
    result = await registerCustomer({
      companyId: company.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash,
      address: parsed.data.address,
      area: parsed.data.area,
    });
  } catch (error) {
    const message = getUniqueConstraintMessage(error);
    if (message) return { error: message };
    throw error;
  }

  await createSession({
    userId: result.user.id,
    role: "CUSTOMER",
    name: result.user.name,
    companyId: company.id,
    companySlug: company.slug,
    customerId: result.customer.id,
  });

  redirect("/customer");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function changePasswordAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireSession();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const user = await getUserPasswordHash(session.userId);
  if (!user) {
    return { error: "المستخدم غير موجود" };
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { error: "كلمة المرور الحالية غير صحيحة" };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await updateUserPassword(session.userId, passwordHash);

  return { success: true };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN") {
    redirect(getHomeForRole(session.role));
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload & { companyId: string }> {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    redirect(getHomeForRole(session.role));
  }
  if (!session.companyId) {
    redirect("/login");
  }
  return session as SessionPayload & { companyId: string };
}

export async function requireDriver(): Promise<
  SessionPayload & { companyId: string; driverId: string }
> {
  const session = await requireSession();
  if (session.role !== "DRIVER" || !session.driverId || !session.companyId) {
    redirect(getHomeForRole(session.role));
  }
  return session as SessionPayload & { companyId: string; driverId: string };
}

export async function requireCustomer(): Promise<
  SessionPayload & { companyId: string; customerId: string }
> {
  const session = await requireSession();
  if (session.role !== "CUSTOMER") {
    redirect(getHomeForRole(session.role));
  }
  if (!session.customerId || !session.companyId) {
    redirect("/login");
  }
  return session as SessionPayload & { companyId: string; customerId: string };
}
