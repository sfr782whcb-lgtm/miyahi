import { prisma } from "@/lib/prisma";
import {
  DRIVER_STATUS_COLORS,
  DRIVER_STATUS_LABELS,
  startOfToday,
} from "@/lib/constants";
import { tenantFilter } from "@/lib/tenant/context";
import type { DriverStatus, Prisma } from "@prisma/client";

export type DriverFilters = {
  search?: string;
  status?: DriverStatus;
  sort?: "name" | "orders";
};

export async function getDrivers(companyId: string, filters?: DriverFilters) {
  const today = startOfToday();
  const where: Prisma.DriverWhereInput = {
    ...tenantFilter(companyId),
  };

  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.name = { contains: filters.search };
  }

  const drivers = await prisma.driver.findMany({
    where,
    orderBy: { name: filters?.sort === "name" ? "asc" : "asc" },
    include: {
      orders: {
        where: { createdAt: { gte: today }, companyId },
        select: { id: true },
      },
    },
  });

  const mapped = drivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    status: driver.status,
    statusLabel: DRIVER_STATUS_LABELS[driver.status],
    statusColor: DRIVER_STATUS_COLORS[driver.status],
    todayOrders: driver.orders.length,
  }));

  if (filters?.sort === "orders") {
    return mapped.sort((a, b) => b.todayOrders - a.todayOrders);
  }

  return mapped;
}

export async function getActiveDriversCount(companyId: string) {
  return prisma.driver.count({
    where: { ...tenantFilter(companyId), status: { not: "OFFLINE" } },
  });
}

export async function getAvailableDrivers(companyId: string) {
  return prisma.driver.findMany({
    where: { ...tenantFilter(companyId), status: "AVAILABLE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createDriver(input: {
  companyId: string;
  name: string;
  phone?: string;
  passwordHash?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const driver = await tx.driver.create({
      data: { companyId: input.companyId, name: input.name },
    });

    if (input.phone && input.passwordHash) {
      await tx.user.create({
        data: {
          companyId: input.companyId,
          phone: input.phone,
          passwordHash: input.passwordHash,
          name: input.name,
          role: "DRIVER",
          driver: { connect: { id: driver.id } },
        },
      });
    }

    return driver;
  });
}

export async function updateDriverStatus(
  companyId: string,
  id: string,
  status: DriverStatus,
) {
  return prisma.driver.updateMany({
    where: { id, companyId },
    data: { status },
  });
}
