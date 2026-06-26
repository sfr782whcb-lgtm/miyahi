export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

export function getVapidSubject(): string {
  const subject = process.env.VAPID_SUBJECT?.trim();
  if (!subject) {
    throw new Error("VAPID_SUBJECT is not configured");
  }
  return subject;
}

export function getVapidPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!key) {
    throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
  }
  return key;
}

export function getVapidPrivateKey(): string {
  const key = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!key) {
    throw new Error("VAPID_PRIVATE_KEY is not configured");
  }
  return key;
}
