"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { getHomeForRole } from "@/lib/auth/routes";
import { loginSchema } from "@/lib/validations/schemas";

export async function loginAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const user = await prisma.user.findUnique({
    where: { phone: parsed.data.phone },
    include: { driver: true, customer: true },
  });

  if (!user) {
    return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    driverId: user.driver?.id,
    customerId: user.customer?.id,
  });

  redirect(getHomeForRole(user.role));
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    redirect(getHomeForRole(session.role));
  }
  return session;
}

export async function requireDriver() {
  const session = await requireSession();
  if (session.role !== "DRIVER" || !session.driverId) {
    redirect(getHomeForRole(session.role));
  }
  return session;
}

export async function requireCustomer() {
  const session = await requireSession();
  if (session.role !== "CUSTOMER") {
    redirect(getHomeForRole(session.role));
  }
  if (!session.customerId) {
    redirect("/");
  }
  return session;
}
