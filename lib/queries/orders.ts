import { prisma } from "@/lib/prisma";
import {
  notifyAdminsNewOrder,
  notifyCustomerStatusChange,
  notifyDriverAssigned,
} from "@/lib/push/order-events";
import {
  formatOrderId,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  startOfToday,
} from "@/lib/constants";
import { tenantFilter } from "@/lib/tenant/context";
import type { OrderStatus, Prisma } from "@prisma/client";

export type OrderFilters = {
  search?: string;
  status?: OrderStatus;
  sort?: "newest" | "oldest" | "price";
  driverId?: string;
  customerId?: string;
  customerPhone?: string;
};

function buildOrderWhere(
  companyId: string,
  filters?: OrderFilters,
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {
    ...tenantFilter(companyId),
  };

  if (filters?.status) where.status = filters.status;
  if (filters?.driverId) where.driverId = filters.driverId;
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.customerPhone) where.phone = filters.customerPhone;

  if (filters?.search) {
    where.OR = [
      { customerName: { contains: filters.search } },
      { phone: { contains: filters.search } },
      { area: { contains: filters.search } },
      { address: { contains: filters.search } },
    ];
  }

  return where;
}

function buildOrderOrderBy(sort?: OrderFilters["sort"]) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "price":
      return { price: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

export function mapOrder(order: {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  bottles: number;
  bottleSize: number;
  status: OrderStatus;
  price: number;
  createdAt: Date;
  driver?: { id: string; name: string } | null;
  product?: { name: string } | null;
}) {
  return {
    id: order.id,
    displayId: formatOrderId(order.id),
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    area: order.area,
    bottles: order.bottles,
    bottleSize: order.bottleSize,
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    statusColor: ORDER_STATUS_COLORS[order.status],
    driverId: order.driver?.id ?? null,
    driverName: order.driver?.name ?? null,
    productName: order.product?.name ?? null,
    price: order.price,
    createdAt: order.createdAt,
  };
}

export async function getDashboardData(companyId: string) {
  const today = startOfToday();

  const [todayOrders, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...tenantFilter(companyId),
        createdAt: { gte: today },
        status: { not: "CANCELLED" },
      },
      select: { status: true, price: true },
    }),
    prisma.order.findMany({
      where: tenantFilter(companyId),
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        driver: { select: { id: true, name: true } },
        product: { select: { name: true } },
      },
    }),
  ]);

  return {
    stats: {
      todayTotal: todayOrders.length,
      delivered: todayOrders.filter((o) => o.status === "DELIVERED").length,
      inDelivery: todayOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
      revenue: todayOrders.reduce((sum, o) => sum + o.price, 0),
    },
    recentOrders: recentOrders.map(mapOrder),
  };
}

export async function getOrders(companyId: string, filters?: OrderFilters) {
  const orders = await prisma.order.findMany({
    where: buildOrderWhere(companyId, filters),
    orderBy: buildOrderOrderBy(filters?.sort),
    include: {
      driver: { select: { id: true, name: true } },
      product: { select: { name: true } },
    },
  });

  return orders.map(mapOrder);
}

export async function createOrder(input: {
  companyId: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  bottles: number;
  bottleSize: number;
  productId: string;
  price: number;
  driverId?: string;
  customerId?: string;
}) {
  const status = input.driverId ? "OUT_FOR_DELIVERY" : "NEW";

  const order = await prisma.order.create({
    data: {
      companyId: input.companyId,
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      area: input.area,
      bottles: input.bottles,
      bottleSize: input.bottleSize,
      productId: input.productId,
      price: input.price,
      driverId: input.driverId || null,
      customerId: input.customerId || null,
      status,
    },
  });

  if (input.driverId) {
    await prisma.driver.updateMany({
      where: { id: input.driverId, companyId: input.companyId },
      data: { status: "BUSY" },
    });
  }

  void notifyAdminsNewOrder(input.companyId, order.id);
  if (input.driverId) {
    void notifyDriverAssigned(input.companyId, order.id, input.driverId);
  }

  return order;
}

export async function updateOrderStatus(
  companyId: string,
  id: string,
  status: OrderStatus,
) {
  const existing = await prisma.order.findFirst({
    where: { id, companyId },
    include: { driver: true },
  });

  if (!existing) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { driver: true },
  });

  if (order.driverId) {
    if (status === "DELIVERED" || status === "CANCELLED") {
      const activeCount = await prisma.order.count({
        where: {
          companyId,
          driverId: order.driverId,
          status: "OUT_FOR_DELIVERY",
          id: { not: id },
        },
      });
      if (activeCount === 0) {
        await prisma.driver.updateMany({
          where: { id: order.driverId, companyId },
          data: { status: "AVAILABLE" },
        });
      }
    } else if (status === "OUT_FOR_DELIVERY") {
      await prisma.driver.updateMany({
        where: { id: order.driverId, companyId },
        data: { status: "BUSY" },
      });
    }
  }

  void notifyCustomerStatusChange(companyId, order.id);

  return order;
}

export async function assignDriverToOrder(
  companyId: string,
  orderId: string,
  driverId: string | null,
) {
  const existing = await prisma.order.findFirst({
    where: { id: orderId, companyId },
  });

  if (!existing) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      driverId,
      status: driverId ? "OUT_FOR_DELIVERY" : "PREPARING",
    },
  });

  if (driverId) {
    await prisma.driver.updateMany({
      where: { id: driverId, companyId },
      data: { status: "BUSY" },
    });
    void notifyDriverAssigned(companyId, order.id, driverId);
  }

  return order;
}
