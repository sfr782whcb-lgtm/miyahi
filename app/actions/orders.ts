"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireCustomer, requireDriver } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import {
  assignDriverToOrder,
  createOrder as createOrderQuery,
  updateOrderStatus,
} from "@/lib/queries/orders";
import { getProducts } from "@/lib/queries/products";
import { orderSchema, orderStatusSchema } from "@/lib/validations/schemas";

export async function createOrderAction(formData: FormData) {
  await requireAdmin();

  const parsed = orderSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    area: formData.get("area"),
    bottles: formData.get("bottles"),
    productId: formData.get("productId"),
    driverId: formData.get("driverId") || undefined,
    customerId: formData.get("customerId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const products = await getProducts(true);
  const product = products.find((p) => p.id === parsed.data.productId);
  if (!product) {
    return { error: "المنتج غير موجود" };
  }

  await createOrderQuery({
    ...parsed.data,
    bottleSize: product.sizeLiters,
    price: parsed.data.bottles * product.price,
  });

  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/drivers");
  revalidatePath("/reports");
  revalidatePath("/driver");

  return { success: true };
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");
  const statusParsed = orderStatusSchema.safeParse(formData.get("status"));

  if (!orderId || !statusParsed.success) {
    return { error: "بيانات غير صالحة" };
  }

  await updateOrderStatus(orderId, statusParsed.data);

  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/drivers");
  revalidatePath("/reports");
  revalidatePath("/driver");
  revalidatePath("/customer");

  return { success: true };
}

export async function assignDriverAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");
  const driverId = String(formData.get("driverId") ?? "") || null;

  if (!orderId) return { error: "معرف الطلب مطلوب" };

  await assignDriverToOrder(orderId, driverId);

  revalidatePath("/orders");
  revalidatePath("/drivers");
  revalidatePath("/driver");

  return { success: true };
}

export async function driverUpdateOrderStatusAction(formData: FormData) {
  const session = await requireDriver();

  const orderId = String(formData.get("orderId") ?? "");
  const statusParsed = orderStatusSchema.safeParse(formData.get("status"));

  if (!orderId || !statusParsed.success) {
    return { error: "بيانات غير صالحة" };
  }

  if (!["OUT_FOR_DELIVERY", "DELIVERED"].includes(statusParsed.data)) {
    return { error: "لا يمكن تحديث الحالة إلى هذه القيمة" };
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, driverId: session.driverId },
  });

  if (!order) {
    return { error: "الطلب غير موجود أو غير مسند إليك" };
  }

  await updateOrderStatus(orderId, statusParsed.data);

  revalidatePath("/driver");
  revalidatePath("/orders");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function customerCreateOrderAction(formData: FormData) {
  const session = await requireCustomer();

  const parsed = orderSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    area: formData.get("area"),
    bottles: formData.get("bottles"),
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const products = await getProducts(true);
  const product = products.find((p) => p.id === parsed.data.productId);
  if (!product) return { error: "المنتج غير موجود" };

  await createOrderQuery({
    ...parsed.data,
    bottleSize: product.sizeLiters,
    price: parsed.data.bottles * product.price,
    customerId: session.customerId,
  });

  revalidatePath("/customer");
  revalidatePath("/orders");
  revalidatePath("/dashboard");

  return { success: true };
}
