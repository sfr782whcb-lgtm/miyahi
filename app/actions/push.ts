"use server";

import { requireSession } from "@/app/actions/auth";
import { getSession } from "@/lib/auth/session";
import { isPushConfigured } from "@/lib/push/config";
import {
  deletePushSubscription,
  savePushSubscription,
  userHasPushSubscription,
} from "@/lib/push/subscriptions";
import { z } from "zod";

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function getPushStatusAction(): Promise<{
  configured: boolean;
  subscribed: boolean;
}> {
  const session = await getSession();

  if (!session) {
    return { configured: isPushConfigured(), subscribed: false };
  }

  if (!isPushConfigured()) {
    return { configured: false, subscribed: false };
  }

  const subscribed = await userHasPushSubscription(session.userId);
  return { configured: true, subscribed };
}

export async function subscribePushAction(
  subscription: unknown,
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireSession();

  if (!isPushConfigured()) {
    return { error: "إشعارات الدفع غير مهيأة على الخادم" };
  }

  const parsed = pushSubscriptionSchema.safeParse(subscription);
  if (!parsed.success) {
    return { error: "بيانات الاشتراك غير صالحة" };
  }

  await savePushSubscription(session.userId, parsed.data);
  return { success: true };
}

export async function unsubscribePushAction(
  endpoint: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireSession();

  if (!endpoint) {
    return { error: "بيانات غير صالحة" };
  }

  await deletePushSubscription(session.userId, endpoint);
  return { success: true };
}
