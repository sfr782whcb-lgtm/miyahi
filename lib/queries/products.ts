import { prisma } from "@/lib/prisma";

export async function getProducts(activeOnly = false) {
  return prisma.product.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sizeLiters: "desc" }, { name: "asc" }],
  });
}

export async function createProduct(input: {
  name: string;
  sizeLiters: number;
  price: number;
}) {
  return prisma.product.create({ data: input });
}

export async function toggleProductActive(id: string, isActive: boolean) {
  return prisma.product.update({
    where: { id },
    data: { isActive },
  });
}
