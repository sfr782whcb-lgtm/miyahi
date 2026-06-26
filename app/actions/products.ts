"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/actions/auth";
import {
  createProduct as createProductQuery,
  toggleProductActive,
} from "@/lib/queries/products";
import { productSchema } from "@/lib/validations/schemas";

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    sizeLiters: formData.get("sizeLiters"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  await createProductQuery(parsed.data);

  revalidatePath("/products");
  revalidatePath("/orders/new");
  revalidatePath("/customer");

  return { success: true };
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";

  if (!id) return { error: "معرف المنتج مطلوب" };

  await toggleProductActive(id, isActive);

  revalidatePath("/products");
  revalidatePath("/orders/new");
  revalidatePath("/customer");

  return { success: true };
}
