import { prisma } from "@/lib/prisma";

export async function getProducts(companyId: string, activeOnly = false) {
  return prisma.product.findMany({
    where: {
      companyId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: [{ sizeLiters: "desc" }, { name: "asc" }],
  });
}

export async function createProduct(
  companyId: string,
  input: {
    name: string;
    sizeLiters: number;
    price: number;
  },
) {
  return prisma.product.create({
    data: {
      companyId,
      ...input,
    },
  });
}

export async function toggleProductActive(
  companyId: string,
  id: string,
  isActive: boolean,
) {
  return prisma.product.updateMany({
    where: { id, companyId },
    data: { isActive },
  });
}
