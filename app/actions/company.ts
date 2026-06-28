"use server";

import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerCompany } from "@/lib/queries/companies";
import { getUniqueConstraintMessage } from "@/lib/prisma-errors";
import { companyRegisterSchema } from "@/lib/validations/schemas";

export async function redirectToTenantRegisterAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!slug) {
    redirect("/register");
  }
  redirect(`/c/${slug}/register`);
}

export async function registerCompanyAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const parsed = companyRegisterSchema.safeParse({
    companyName: formData.get("companyName"),
    companySlug: formData.get("companySlug"),
    adminName: formData.get("adminName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    companyPhone: formData.get("companyPhone") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  let result;
  try {
    result = await registerCompany({
      companyName: parsed.data.companyName,
      slug: parsed.data.companySlug,
      adminName: parsed.data.adminName,
      phone: parsed.data.phone,
      passwordHash,
      companyPhone: parsed.data.companyPhone,
      address: parsed.data.address,
    });
  } catch (error) {
    const uniqueMessage = getUniqueConstraintMessage(error);
    if (uniqueMessage) return { error: uniqueMessage };
    throw error;
  }

  await createSession(
    {
      userId: result.admin.id,
      role: "ADMIN",
      name: result.admin.name,
      companyId: result.company.id,
      companySlug: result.company.slug,
    },
    { remember: true },
  );

  redirect("/dashboard");
}
