import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type CustomerFilters = {
  search?: string;
  sort?: "name" | "newest";
};

export async function getCustomers(filters?: CustomerFilters) {
  const where: Prisma.CustomerWhereInput = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { phone: { contains: filters.search } },
      { area: { contains: filters.search } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: filters?.sort === "newest" ? "desc" : "asc" },
    include: { _count: { select: { orders: true } } },
  });

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    area: c.area,
    ordersCount: c._count.orders,
    createdAt: c.createdAt,
  }));
}

export async function createCustomer(input: {
  name: string;
  phone: string;
  address?: string;
  area?: string;
  passwordHash?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        name: input.name,
        phone: input.phone,
        address: input.address,
        area: input.area,
      },
    });

    if (input.passwordHash) {
      await tx.user.create({
        data: {
          phone: input.phone,
          passwordHash: input.passwordHash,
          name: input.name,
          role: "CUSTOMER",
          customer: { connect: { id: customer.id } },
        },
      });
    }

    return customer;
  });
}
