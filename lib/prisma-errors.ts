import { Prisma } from "@prisma/client";

export function getUniqueConstraintMessage(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    if (Array.isArray(target) && target.includes("phone")) {
      return "رقم الهاتف مستخدم بالفعل";
    }
    return "البيانات موجودة مسبقاً";
  }
  return null;
}
