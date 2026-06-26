import webpush from "web-push";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isPushConfigured,
  type PushPayload,
} from "@/lib/push/config";
import {
  deletePushSubscriptionByEndpoint,
  getPushSubscriptionsForUsers,
} from "@/lib/push/subscriptions";

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured || !isPushConfigured()) return;

  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey(),
    getVapidPrivateKey(),
  );
  vapidConfigured = true;
}

export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<void> {
  if (!isPushConfigured() || userIds.length === 0) return;

  ensureVapidConfigured();

  const subscriptions = await getPushSubscriptionsForUsers(userIds);
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          body,
        );
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscriptionByEndpoint(subscription.endpoint);
        } else {
          console.error("Push notification failed:", error);
        }
      }
    }),
  );
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  return sendPushToUsers([userId], payload);
}
