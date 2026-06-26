import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(9, "رقم الهاتف غير صالح")
    .max(15, "رقم الهاتف غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "اسم الزبون مطلوب"),
  phone: z.string().trim().min(9, "رقم الهاتف غير صالح"),
  address: z.string().trim().min(3, "العنوان مطلوب"),
  area: z.string().trim().min(2, "المنطقة مطلوبة"),
  bottles: z.coerce.number().int().min(1, "عدد القوارير يجب أن يكون 1 على الأقل"),
  productId: z.string().min(1, "اختر المنتج"),
  driverId: z.string().optional(),
  customerId: z.string().optional(),
});

export const driverSchema = z.object({
  name: z.string().trim().min(2, "اسم السائق مطلوب"),
  phone: z.string().trim().min(9, "رقم الهاتف غير صالح").optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "اسم الزبون مطلوب"),
  phone: z.string().trim().min(9, "رقم الهاتف غير صالح"),
  address: z.string().trim().optional(),
  area: z.string().trim().optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "اسم المنتج مطلوب"),
  sizeLiters: z.coerce.number().int().refine((v) => v === 10 || v === 20, {
    message: "الحجم يجب أن يكون 10 أو 20 لتر",
  }),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
});

export const orderStatusSchema = z.enum([
  "NEW",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const driverStatusSchema = z.enum(["AVAILABLE", "BUSY", "OFFLINE"]);

export const orderFilterSchema = z.object({
  search: z.string().optional(),
  status: orderStatusSchema.optional(),
  sort: z.enum(["newest", "oldest", "price"]).optional(),
});
