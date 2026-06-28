import { formatOrderId, ORDER_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sendPushToUser, sendPushToUsers } from "@/lib/push/send";
import {
  getAdminUserIds,
  getCustomerUserId,
  getDriverUserId,
} from "@/lib/push/subscriptions";

async function getOrderNotificationContext(companyId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, companyId },
    select: {
      id: true,
      customerName: true,
      area: true,
      status: true,
      customerId: true,
      driverId: true,
    },
  });
}

export async function notifyAdminsNewOrder(
  companyId: string,
  orderId: string,
): Promise<void> {
  try {
    const [order, adminIds] = await Promise.all([
      getOrderNotificationContext(companyId, orderId),
      getAdminUserIds(companyId),
    ]);

    if (!order || adminIds.length === 0) return;

    await sendPushToUsers(adminIds, {
      title: "طلب جديد",
      body: `طلب ${formatOrderId(order.id)} من ${order.customerName} — ${order.area}`,
      url: "/orders",
      tag: `order-new-${order.id}`,
    });
  } catch (error) {
    console.error("Failed to notify admins about new order:", error);
  }
}

export async function notifyDriverAssigned(
  companyId: string,
  orderId: string,
  driverId: string,
): Promise<void> {
  try {
    const [order, driverUserId] = await Promise.all([
      getOrderNotificationContext(companyId, orderId),
      getDriverUserId(companyId, driverId),
    ]);

    if (!order || !driverUserId) return;

    await sendPushToUser(driverUserId, {
      title: "طلب جديد مسند إليك",
      body: `طلب ${formatOrderId(order.id)} في ${order.area}`,
      url: "/driver",
      tag: `order-assigned-${order.id}`,
    });
  } catch (error) {
    console.error("Failed to notify driver about assignment:", error);
  }
}

export async function notifyCustomerStatusChange(
  companyId: string,
  orderId: string,
): Promise<void> {
  try {
    const order = await getOrderNotificationContext(companyId, orderId);
    if (!order?.customerId) return;

    const customerUserId = await getCustomerUserId(companyId, order.customerId);
    if (!customerUserId) return;

    await sendPushToUser(customerUserId, {
      title: "تحديث حالة الطلب",
      body: `طلب ${formatOrderId(order.id)}: ${ORDER_STATUS_LABELS[order.status]}`,
      url: "/customer",
      tag: `order-status-${order.id}`,
    });
  } catch (error) {
    console.error("Failed to notify customer about status change:", error);
  }
}
