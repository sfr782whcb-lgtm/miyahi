"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/actions/auth";
import { createCustomer as createCustomerQuery } from "@/lib/queries/customers";
import { hashPassword } from "@/lib/auth/password";
import { customerSchema } from "@/lib/validations/schemas";

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
    if (password.length < 6) {
      return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
    }
    passwordHash = await hashPassword(password);
  }

  await createCustomerQuery({
    ...parsed.data,
    passwordHash,
  });

  revalidatePath("/customers");

  return { success: true };
}
