import { prisma } from "@/lib/prisma";

async function assertBelongsToCompany(
  companyId: string,
  model: "order" | "product" | "customer" | "driver",
  id: string,
) {
  switch (model) {
    case "order": {
      const record = await prisma.order.findFirst({ where: { id, companyId }, select: { id: true } });
      if (!record) throw new Error("ORDER_NOT_FOUND");
      return record;
    }
    case "product": {
      const record = await prisma.product.findFirst({ where: { id, companyId }, select: { id: true } });
      if (!record) throw new Error("PRODUCT_NOT_FOUND");
      return record;
    }
    case "customer": {
      const record = await prisma.customer.findFirst({ where: { id, companyId }, select: { id: true } });
      if (!record) throw new Error("CUSTOMER_NOT_FOUND");
      return record;
    }
    case "driver": {
      const record = await prisma.driver.findFirst({ where: { id, companyId }, select: { id: true } });
      if (!record) throw new Error("DRIVER_NOT_FOUND");
      return record;
    }
  }
}

export async function assertOrderBelongsToCompany(companyId: string, orderId: string) {
  return assertBelongsToCompany(companyId, "order", orderId);
}

export async function assertProductBelongsToCompany(companyId: string, productId: string) {
  return assertBelongsToCompany(companyId, "product", productId);
}

export async function assertCustomerBelongsToCompany(companyId: string, customerId: string) {
  return assertBelongsToCompany(companyId, "customer", customerId);
}

export async function assertDriverBelongsToCompany(companyId: string, driverId: string) {
  return assertBelongsToCompany(companyId, "driver", driverId);
}
