import { prisma } from "@/lib/prisma";
import {
  DRIVER_STATUS_COLORS,
  DRIVER_STATUS_LABELS,
  startOfToday,
} from "@/lib/constants";
import type { DriverStatus, Prisma } from "@prisma/client";

export type DriverFilters = {
  search?: string;
  status?: DriverStatus;
  sort?: "name" | "orders";
};

export async function getDrivers(filters?: DriverFilters) {
  const today = startOfToday();
  const where: Prisma.DriverWhereInput = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.name = { contains: filters.search };
  }

  const drivers = await prisma.driver.findMany({
    where,
    orderBy: { name: filters?.sort === "name" ? "asc" : "asc" },
    include: {
      orders: {
        where: { createdAt: { gte: today } },
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

export async function getActiveDriversCount() {
  return prisma.driver.count({
    where: { status: { not: "OFFLINE" } },
  });
}

export async function getAvailableDrivers() {
  return prisma.driver.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createDriver(input: {
  name: string;
  phone?: string;
  passwordHash?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const driver = await tx.driver.create({
      data: { name: input.name },
    });

    if (input.phone && input.passwordHash) {
      await tx.user.create({
        data: {
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

export async function updateDriverStatus(id: string, status: DriverStatus) {
  return prisma.driver.update({
    where: { id },
    data: { status },
  });
}
