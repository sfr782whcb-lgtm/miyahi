import { prisma } from "@/lib/prisma";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionInput,
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function deletePushSubscription(userId: string, endpoint: string) {
  return prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function deletePushSubscriptionByEndpoint(endpoint: string) {
  return prisma.pushSubscription.deleteMany({
    where: { endpoint },
  });
}

export async function getUserPushSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({
    where: { userId },
  });
}

export async function getPushSubscriptionsForUsers(userIds: string[]) {
  if (userIds.length === 0) return [];

  return prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });
}

export async function getAdminUserIds(companyId: string) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", companyId },
    select: { id: true },
  });
  return admins.map((admin) => admin.id);
}

export async function getDriverUserId(companyId: string, driverId: string) {
  const driver = await prisma.driver.findFirst({
    where: { id: driverId, companyId },
    select: { userId: true },
  });
  return driver?.userId ?? null;
}

export async function getCustomerUserId(companyId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, companyId },
    select: { userId: true },
  });
  return customer?.userId ?? null;
}

export async function userHasPushSubscription(userId: string) {
  const count = await prisma.pushSubscription.count({
    where: { userId },
  });
  return count > 0;
}
