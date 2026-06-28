"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CompanyStatus, SubscriptionPlan } from "@prisma/client";
import { requireSuperAdmin } from "@/app/actions/auth";
import { hashPassword } from "@/lib/auth/password";
import { getUniqueConstraintMessage } from "@/lib/prisma-errors";
import {
  addDays,
  addMonths,
  createPlatformCompany,
  reactivatePlatformCompany,
  softDeletePlatformCompany,
  suspendPlatformCompany,
  TRIAL_DAYS,
  updatePlatformCompany,
} from "@/lib/queries/platform";
import {
  platformCompanyCreateSchema,
  platformCompanyUpdateSchema,
} from "@/lib/validations/schemas";

const PLATFORM_PATHS = [
  "/platform",
  "/platform/companies",
  "/platform/subscriptions",
  "/platform/analytics",
];

function revalidatePlatform() {
  for (const path of PLATFORM_PATHS) {
    revalidatePath(path);
  }
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null | undefined {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseSubscriptionPlan(value: FormDataEntryValue | null): SubscriptionPlan | null {
  const str = String(value ?? "").trim();
  if (str === "MONTHLY" || str === "YEARLY") return str;
  return null;
}

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function defaultDatesForStatus(status: CompanyStatus, plan: SubscriptionPlan | null) {
  const now = new Date();
  if (status === "TRIAL") {
    return { trialEndsAt: addDays(now, TRIAL_DAYS), subscriptionEndsAt: null };
  }
  if (status === "ACTIVE" && plan === "MONTHLY") {
    return { trialEndsAt: null, subscriptionEndsAt: addMonths(now, 1) };
  }
  if (status === "ACTIVE" && plan === "YEARLY") {
    return { trialEndsAt: null, subscriptionEndsAt: addMonths(now, 12) };
  }
  return { trialEndsAt: null, subscriptionEndsAt: null };
}

export async function createPlatformCompanyAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  await requireSuperAdmin();

  const parsed = platformCompanyCreateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    primaryColor: formData.get("primaryColor") || undefined,
    status: formData.get("status"),
    subscriptionPlan: formData.get("subscriptionPlan") || "",
    trialEndsAt: formData.get("trialEndsAt") || undefined,
    subscriptionEndsAt: formData.get("subscriptionEndsAt") || undefined,
    adminName: formData.get("adminName"),
    adminPhone: formData.get("adminPhone"),
    adminPassword: formData.get("adminPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const plan = parseSubscriptionPlan(parsed.data.subscriptionPlan ?? null);
  const defaults = defaultDatesForStatus(parsed.data.status, plan);
  const trialEndsAt = parseOptionalDate(parsed.data.trialEndsAt ?? null) ?? defaults.trialEndsAt;
  const subscriptionEndsAt =
    parseOptionalDate(parsed.data.subscriptionEndsAt ?? null) ?? defaults.subscriptionEndsAt;

  if (trialEndsAt === undefined || subscriptionEndsAt === undefined) {
    return { error: "تاريخ غير صالح" };
  }

  const passwordHash = await hashPassword(parsed.data.adminPassword);

  try {
    const company = await createPlatformCompany({
      name: parsed.data.name,
      slug: parsed.data.slug,
      phone: parsed.data.phone,
      address: parsed.data.address,
      primaryColor: parsed.data.primaryColor,
      status: parsed.data.status,
      subscriptionPlan: plan,
      trialEndsAt,
      subscriptionEndsAt,
      adminName: parsed.data.adminName,
      adminPhone: parsed.data.adminPhone,
      adminPasswordHash: passwordHash,
    });

    revalidatePlatform();
    redirect(`/platform/companies/${company.id}`);
  } catch (error) {
    const uniqueMessage = getUniqueConstraintMessage(error);
    if (uniqueMessage) return { error: uniqueMessage };
    throw error;
  }
}

export async function updatePlatformCompanyAction(
  id: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  await requireSuperAdmin();

  const parsed = platformCompanyUpdateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    primaryColor: formData.get("primaryColor") || undefined,
    status: formData.get("status"),
    subscriptionPlan: formData.get("subscriptionPlan") || "",
    trialEndsAt: formData.get("trialEndsAt") || undefined,
    subscriptionEndsAt: formData.get("subscriptionEndsAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const plan = parseSubscriptionPlan(parsed.data.subscriptionPlan ?? null);
  const trialEndsAt = parseOptionalDate(parsed.data.trialEndsAt ?? null);
  const subscriptionEndsAt = parseOptionalDate(parsed.data.subscriptionEndsAt ?? null);

  if (trialEndsAt === undefined || subscriptionEndsAt === undefined) {
    return { error: "تاريخ غير صالح" };
  }

  try {
    await updatePlatformCompany(id, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      primaryColor: parsed.data.primaryColor,
      status: parsed.data.status,
      subscriptionPlan: plan,
      trialEndsAt,
      subscriptionEndsAt,
    });
  } catch (error) {
    const uniqueMessage = getUniqueConstraintMessage(error);
    if (uniqueMessage) return { error: uniqueMessage };
    throw error;
  }

  revalidatePlatform();
  redirect(`/platform/companies/${id}`);
}

export async function suspendPlatformCompanyAction(id: string): Promise<{ error: string } | void> {
  await requireSuperAdmin();
  try {
    await suspendPlatformCompany(id);
  } catch {
    return { error: "تعذر تعليق الشركة" };
  }
  revalidatePlatform();
}

export async function reactivatePlatformCompanyAction(
  id: string,
): Promise<{ error: string } | void> {
  await requireSuperAdmin();
  try {
    await reactivatePlatformCompany(id);
  } catch {
    return { error: "تعذر إعادة تفعيل الشركة" };
  }
  revalidatePlatform();
}

export async function deletePlatformCompanyAction(id: string): Promise<{ error: string } | void> {
  await requireSuperAdmin();
  try {
    await softDeletePlatformCompany(id);
  } catch {
    return { error: "تعذر حذف الشركة" };
  }
  revalidatePlatform();
  redirect("/platform/companies");
}
