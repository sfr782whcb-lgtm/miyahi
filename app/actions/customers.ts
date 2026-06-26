"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/actions/auth";
import { createCustomer as createCustomerQuery } from "@/lib/queries/customers";
import { hashPassword } from "@/lib/auth/password";
import { getUniqueConstraintMessage } from "@/lib/prisma-errors";
import { customerSchema, passwordSchema } from "@/lib/validations/schemas";

export async function createCustomerAction(formData: FormData) {
  await requireAdmin();

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address") || undefined,
    area: formData.get("area") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const createAccount = formData.get("createAccount") === "on";
  const password = String(formData.get("password") ?? "");

  let passwordHash: string | undefined;
  if (createAccount) {
    const passwordParsed = passwordSchema.safeParse(password);
    if (!passwordParsed.success) {
      return {
        error:
          passwordParsed.error.issues[0]?.message ??
          "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      };
    }
    passwordHash = await hashPassword(passwordParsed.data);
  }

  try {
    await createCustomerQuery({
      ...parsed.data,
      passwordHash,
    });
  } catch (error) {
    const message = getUniqueConstraintMessage(error);
    if (message) return { error: message };
    throw error;
  }

  revalidatePath("/customers");

  return { success: true };
}
