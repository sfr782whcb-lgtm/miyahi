import { prisma } from "@/lib/prisma";
import { startOfMonth } from "@/lib/constants";

export async function getReportsData() {
  const monthStart = startOfMonth();

  const monthOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: monthStart },
      status: { not: "CANCELLED" },
    },
    select: {
      area: true,
      price: true,
      status: true,
      driverId: true,
      driver: { select: { name: true } },
    },
  });

  const areaCounts = new Map<string, number>();
  const driverCounts = new Map<string, { name: string; count: number }>();

  for (const order of monthOrders) {
    areaCounts.set(order.area, (areaCounts.get(order.area) ?? 0) + 1);

    if (order.status === "DELIVERED" && order.driverId && order.driver) {
      const current = driverCounts.get(order.driverId);
      if (current) current.count += 1;
      else driverCounts.set(order.driverId, { name: order.driver.name, count: 1 });
    }
  }

  return {
    monthStats: {
      totalOrders: monthOrders.length,
      revenue: monthOrders.reduce((sum, o) => sum + o.price, 0),
    },
    topAreas: [...areaCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, orders]) => ({ name, orders })),
    bestDriver: [...driverCounts.values()].sort((a, b) => b.count - a.count)[0] ?? null,
  };
}
