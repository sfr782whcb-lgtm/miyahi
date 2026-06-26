"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getPushStatusAction,
  subscribePushAction,
  unsubscribePushAction,
} from "@/app/actions/push";
import {
  getVapidPublicKeyFromEnv,
  isPushSupported,
  urlBase64ToUint8Array,
} from "@/lib/push/client";

type PromptState = "loading" | "unsupported" | "unconfigured" | "denied" | "prompt" | "subscribed";

export default function PushNotificationPrompt() {
  const [state, setState] = useState<PromptState>("loading");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }

    if (!getVapidPublicKeyFromEnv()) {
      setState("unconfigured");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    startTransition(async () => {
      const status = await getPushStatusAction();
      if (!status.configured) {
        setState("unconfigured");
        return;
      }

      if (status.subscribed) {
        setState("subscribed");
        return;
      }

      setState("prompt");
    });
  }, []);

  async function enableNotifications() {
    if (!isPushSupported()) return;

    const vapidPublicKey = getVapidPublicKeyFromEnv();
    if (!vapidPublicKey) {
      toast.error("إشعارات الدفع غير مهيأة");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      toast.error("تم رفض إذن الإشعارات");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const result = await subscribePushAction(subscription.toJSON());
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setState("subscribed");
      toast.success("تم تفعيل الإشعارات");
    } catch (error) {
      console.error(error);
      toast.error("تعذر تفعيل الإشعارات");
    }
  }

  async function disableNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribePushAction(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setState("prompt");
      toast.success("تم إيقاف الإشعارات");
    } catch (error) {
      console.error(error);
      toast.error("تعذر إيقاف الإشعارات");
    }
  }

  if (state === "loading" || state === "unsupported" || state === "unconfigured") {
    return null;
  }

  if (state === "denied") {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        الإشعارات محظورة في إعدادات المتصفح. فعّلها من هناك لتلقي التحديثات.
      </div>
    );
  }

  if (state === "subscribed") {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <span>الإشعارات مفعّلة — ستصلك تحديثات الطلبات</span>
        <button
          type="button"
          onClick={() => startTransition(disableNotifications)}
          disabled={isPending}
          className="shrink-0 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
        >
          إيقاف
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <span>فعّل الإشعارات لتلقي تحديثات الطلبات فوراً</span>
      <button
        type="button"
        onClick={() => startTransition(enableNotifications)}
        disabled={isPending}
        className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "جاري..." : "تفعيل الإشعارات"}
      </button>
    </div>
  );
}
