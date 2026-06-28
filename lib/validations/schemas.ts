import { z } from "zod";
import {
  normalizePhone,
  SAUDI_PHONE_MESSAGE,
  SAUDI_PHONE_REGEX,
} from "@/lib/validations/phone";
import { isReservedCompanySlug } from "@/lib/validations/slug";

export const companySlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "رمز الشركة يجب أن يكون 3 أحرف على الأقل")
  .max(48, "رمز الشركة طويل جداً")
  .regex(/^[a-z0-9-]+$/, "استخدم أحرفاً إنجليزية صغيرة وأرقام وشرطات فقط")
  .refine((slug) => !isReservedCompanySlug(slug), {
    message: "رمز الشركة محجوز، اختر رمزاً آخر",
  });

export const passwordSchema = z
  .string()
  .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل");

export const saudiPhoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .pipe(z.string().regex(SAUDI_PHONE_REGEX, SAUDI_PHONE_MESSAGE));

export const loginCompanySlugSchema = z.union([
  z.literal("platform"),
  companySlugSchema,
]);

export const loginSchema = z.object({
  phone: saudiPhoneSchema,
  password: passwordSchema,
  companySlug: loginCompanySlugSchema,
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  phone: saudiPhoneSchema,
  companySlug: companySlugSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "رمز إعادة التعيين مطلوب"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const companyRegisterSchema = z
  .object({
    companyName: z.string().trim().min(2, "اسم الشركة مطلوب"),
    companySlug: companySlugSchema,
    adminName: z.string().trim().min(2, "اسم المدير مطلوب"),
    phone: saudiPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    companyPhone: z.string().trim().optional(),
    address: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "اسم الزبون مطلوب"),
  phone: saudiPhoneSchema,
  address: z.string().trim().min(3, "العنوان مطلوب"),
  area: z.string().trim().min(2, "المنطقة مطلوبة"),
  bottles: z.coerce.number().int().min(1, "عدد القوارير يجب أن يكون 1 على الأقل"),
  productId: z.string().min(1, "اختر المنتج"),
  driverId: z.string().optional(),
  customerId: z.string().optional(),
});

export const driverSchema = z
  .object({
    name: z.string().trim().min(2, "اسم السائق مطلوب"),
    phone: z.string().trim().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const phone = data.phone ? normalizePhone(data.phone) : "";
    const hasPhone = phone.length > 0;
    const password = data.password ?? "";
    const hasPassword = password.length > 0;

    if (hasPhone && !SAUDI_PHONE_REGEX.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message: SAUDI_PHONE_MESSAGE,
        path: ["phone"],
      });
    }

    if (hasPhone && !hasPassword) {
      ctx.addIssue({
        code: "custom",
        message: "كلمة المرور مطلوبة عند إنشاء حساب دخول",
        path: ["password"],
      });
    }

    if (hasPassword && !hasPhone) {
      ctx.addIssue({
        code: "custom",
        message: "رقم الهاتف مطلوب عند إنشاء حساب دخول",
        path: ["phone"],
      });
    }

    if (hasPassword && password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        path: ["password"],
      });
    }
  });

export const customerSchema = z.object({
  name: z.string().trim().min(2, "اسم الزبون مطلوب"),
  phone: saudiPhoneSchema,
  address: z.string().trim().optional(),
  area: z.string().trim().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "الاسم مطلوب"),
    phone: saudiPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    address: z.string().trim().optional(),
    area: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
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
