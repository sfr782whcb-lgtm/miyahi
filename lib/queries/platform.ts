import { prisma } from "@/lib/prisma";
import { computePlaceholderMrr, PLATFORM_PAGE_SIZE } from "@/lib/constants/platform";
import { startOfMonth } from "@/lib/constants";
import type { CompanyStatus, Prisma, SubscriptionPlan } from "@prisma/client";

const DEFAULT_PRODUCTS = [
  { name: "قارورة 20 لتر", sizeLiters: 20, price: 5 },
  { name: "قارورة 10 لتر", sizeLiters: 10, price: 3 },
];

const TRIAL_DAYS = 14;

function notDeletedWhere(includeDeleted: boolean): Prisma.CompanyWhereInput {
  return includeDeleted ? {} : { deletedAt: null };
}

export type CompanyListFilters = {
  search?: string;
  status?: CompanyStatus;
  plan?: SubscriptionPlan | "NONE";
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
};

export async function getPlatformDashboardStats() {
  const monthStart = startOfMonth();
  const baseWhere = { deletedAt: null };

  const [
    totalCompanies,
    activeCompanies,
    suspendedCompanies,
    trialCompanies,
    expiredCompanies,
    totalCustomers,
    totalDrivers,
    totalOrders,
    monthlyOrderRevenue,
    monthlySubscriptions,
    yearlySubscriptions,
    recentCompanies,
  ] = await Promise.all([
    prisma.company.count({ where: baseWhere }),
    prisma.company.count({ where: { ...baseWhere, status: "ACTIVE" } }),
    prisma.company.count({ where: { ...baseWhere, status: "SUSPENDED" } }),
    prisma.company.count({ where: { ...baseWhere, status: "TRIAL" } }),
    prisma.company.count({ where: { ...baseWhere, status: "EXPIRED" } }),
    prisma.customer.count({ where: { company: baseWhere } }),
    prisma.driver.count({ where: { company: baseWhere } }),
    prisma.order.count({ where: { company: baseWhere } }),
    prisma.order.aggregate({
      where: {
        company: baseWhere,
        createdAt: { gte: monthStart },
        status: { not: "CANCELLED" },
      },
      _sum: { price: true },
    }),
    prisma.company.count({
      where: { ...baseWhere, status: "ACTIVE", subscriptionPlan: "MONTHLY" },
    }),
    prisma.company.count({
      where: { ...baseWhere, status: "ACTIVE", subscriptionPlan: "YEARLY" },
    }),
    prisma.company.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        subscriptionPlan: true,
        createdAt: true,
        _count: { select: { orders: true, customers: true } },
      },
    }),
  ]);

  return {
    totalCompanies,
    activeCompanies,
    suspendedCompanies,
    trialCompanies,
    expiredCompanies,
    totalCustomers,
    totalDrivers,
    totalOrders,
    monthlyOrderRevenue: monthlyOrderRevenue._sum.price ?? 0,
    monthlySubscriptionRevenue: computePlaceholderMrr(
      monthlySubscriptions,
      yearlySubscriptions,
    ),
    recentCompanies,
  };
}

export async function listPlatformCompanies(filters: CompanyListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PLATFORM_PAGE_SIZE;
  const skip = (page - 1) * pageSize;

  const where: Prisma.CompanyWhereInput = {
    ...notDeletedWhere(filters.includeDeleted ?? false),
  };

  if (filters.status) where.status = filters.status;
  if (filters.plan === "NONE") where.subscriptionPlan = null;
  else if (filters.plan) where.subscriptionPlan = filters.plan;

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        status: true,
        subscriptionPlan: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        deletedAt: true,
        createdAt: true,
        _count: { select: { customers: true, drivers: true, orders: true, users: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPlatformCompany(id: string) {
  return prisma.company.findFirst({
    where: { id },
    include: {
      _count: { select: { customers: true, drivers: true, orders: true, users: true, products: true } },
      users: {
        where: { role: "ADMIN" },
        take: 1,
        select: { id: true, name: true, phone: true },
      },
    },
  });
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function createPlatformCompany(input: {
  name: string;
  slug: string;
  status: CompanyStatus;
  subscriptionPlan?: SubscriptionPlan | null;
  trialEndsAt?: Date | null;
  subscriptionEndsAt?: Date | null;
  phone?: string;
  address?: string;
  primaryColor?: string;
  adminName: string;
  adminPhone: string;
  adminPasswordHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.name,
        slug: input.slug,
        phone: input.phone,
        address: input.address,
        primaryColor: input.primaryColor ?? "#059669",
        status: input.status,
        subscriptionPlan: input.subscriptionPlan,
        trialEndsAt: input.trialEndsAt,
        subscriptionEndsAt: input.subscriptionEndsAt,
      },
    });

    await tx.user.create({
      data: {
        companyId: company.id,
        phone: input.adminPhone,
        passwordHash: input.adminPasswordHash,
        name: input.adminName,
        role: "ADMIN",
      },
    });

    for (const product of DEFAULT_PRODUCTS) {
      await tx.product.create({ data: { companyId: company.id, ...product } });
    }

    return company;
  });
}

export async function updatePlatformCompany(
  id: string,
  data: {
    name?: string;
    slug?: string;
    phone?: string | null;
    address?: string | null;
    primaryColor?: string;
    status?: CompanyStatus;
    subscriptionPlan?: SubscriptionPlan | null;
    trialEndsAt?: Date | null;
    subscriptionEndsAt?: Date | null;
  },
) {
  return prisma.company.update({ where: { id }, data });
}

export async function suspendPlatformCompany(id: string) {
  return prisma.company.update({
    where: { id, deletedAt: null },
    data: { status: "SUSPENDED" },
  });
}

export async function reactivatePlatformCompany(id: string) {
  return prisma.company.update({
    where: { id, deletedAt: null },
    data: { status: "ACTIVE" },
  });
}

export async function softDeletePlatformCompany(id: string) {
  return prisma.company.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), status: "SUSPENDED" },
  });
}

export async function restorePlatformCompany(id: string) {
  return prisma.company.update({
    where: { id },
    data: { deletedAt: null },
  });
}

export async function getPlatformAnalytics() {
  const monthStart = startOfMonth();
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    orderBy: { orders: { _count: "desc" } },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      subscriptionPlan: true,
      createdAt: true,
      _count: { select: { orders: true, customers: true, drivers: true } },
      orders: {
        where: {
          createdAt: { gte: monthStart },
          status: { not: "CANCELLED" },
        },
        select: { price: true },
      },
    },
  });

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    status: company.status,
    subscriptionPlan: company.subscriptionPlan,
    createdAt: company.createdAt,
    ordersCount: company._count.orders,
    customersCount: company._count.customers,
    driversCount: company._count.drivers,
    monthlyRevenue: company.orders.reduce((sum, o) => sum + o.price, 0),
  }));
}

export async function getPlatformCompanyGrowth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const companies = await prisma.company.findMany({
    where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (const company of companies) {
    const key = `${company.createdAt.getFullYear()}-${String(company.createdAt.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const months: { label: string; count: number }[] = [];
  for (let i = 0; i < 6; i += 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      label: date.toLocaleDateString("ar-SA", { month: "short", year: "numeric" }),
      count: buckets.get(key) ?? 0,
    });
  }

  return months;
}

export async function getPlatformSubscriptionOverview() {
  const baseWhere = { deletedAt: null };

  const [trial, active, expired, suspended, monthly, yearly, activeMonthly, activeYearly] =
    await Promise.all([
    prisma.company.count({ where: { ...baseWhere, status: "TRIAL" } }),
    prisma.company.count({ where: { ...baseWhere, status: "ACTIVE" } }),
    prisma.company.count({ where: { ...baseWhere, status: "EXPIRED" } }),
    prisma.company.count({ where: { ...baseWhere, status: "SUSPENDED" } }),
    prisma.company.count({ where: { ...baseWhere, subscriptionPlan: "MONTHLY" } }),
    prisma.company.count({ where: { ...baseWhere, subscriptionPlan: "YEARLY" } }),
    prisma.company.count({
      where: { ...baseWhere, status: "ACTIVE", subscriptionPlan: "MONTHLY" },
    }),
    prisma.company.count({
      where: { ...baseWhere, status: "ACTIVE", subscriptionPlan: "YEARLY" },
    }),
  ]);

  const expiringSoon = await prisma.company.findMany({
    where: {
      ...baseWhere,
      subscriptionEndsAt: {
        gte: new Date(),
        lte: addDays(new Date(), 30),
      },
    },
    orderBy: { subscriptionEndsAt: "asc" },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      subscriptionPlan: true,
      subscriptionEndsAt: true,
      trialEndsAt: true,
    },
  });

  return {
    trial,
    active,
    expired,
    suspended,
    monthly,
    yearly,
    placeholderMrr: computePlaceholderMrr(activeMonthly, activeYearly),
    expiringSoon,
  };
}

export { addDays, addMonths, TRIAL_DAYS };
