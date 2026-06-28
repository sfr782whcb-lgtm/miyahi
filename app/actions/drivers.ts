"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/actions/auth";
import {
  createDriver as createDriverQuery,
  updateDriverStatus,
} from "@/lib/queries/drivers";
import { hashPassword } from "@/lib/auth/password";
import { getUniqueConstraintMessage } from "@/lib/prisma-errors";
import { normalizePhone } from "@/lib/validations/phone";
import { driverSchema, driverStatusSchema } from "@/lib/validations/schemas";

export async function createDriverAction(formData: FormData) {
  const session = await requireAdmin();

  const parsed = driverSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  let passwordHash: string | undefined;
  if (parsed.data.password) {
    passwordHash = await hashPassword(parsed.data.password);
  }

  const phone = parsed.data.phone
    ? normalizePhone(parsed.data.phone)
    : undefined;

  try {
    await createDriverQuery({
      companyId: session.companyId,
      name: parsed.data.name,
      phone,
      passwordHash,
    });
  } catch (error) {
    const message = getUniqueConstraintMessage(error);
    if (message) return { error: message };
    throw error;
  }

  revalidatePath("/drivers");
  revalidatePath("/orders/new");

  return { success: true };
}

export async function updateDriverStatusAction(formData: FormData) {
  const session = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const statusParsed = driverStatusSchema.safeParse(formData.get("status"));

  if (!id || !statusParsed.success) {
    return { error: "بيانات غير صالحة" };
  }

  const result = await updateDriverStatus(
    session.companyId,
    id,
    statusParsed.data,
  );

  if (result.count === 0) {
    return { error: "السائق غير موجود" };
  }

  revalidatePath("/drivers");
  revalidatePath("/orders/new");

  return { success: true };
}
