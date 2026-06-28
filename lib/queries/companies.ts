import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const DEFAULT_PRODUCTS = [
  { name: "قارورة 20 لتر", sizeLiters: 20, price: 5 },
  { name: "قارورة 10 لتر", sizeLiters: 10, price: 3 },
];

const TRIAL_DAYS = 14;

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      primaryColor: true,
      logoUrl: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
    },
  });
}

export async function registerCompany(input: {
  companyName: string;
  slug: string;
  adminName: string;
  phone: string;
  passwordHash: string;
  companyPhone?: string;
  address?: string;
}) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.companyName,
        slug: input.slug,
        phone: input.companyPhone,
        address: input.address,
        status: "TRIAL",
        trialEndsAt,
      },
    });

    const admin = await tx.user.create({
      data: {
        companyId: company.id,
        phone: input.phone,
        passwordHash: input.passwordHash,
        name: input.adminName,
        role: "ADMIN",
      },
    });

    for (const product of DEFAULT_PRODUCTS) {
      await tx.product.create({
        data: { companyId: company.id, ...product },
      });
    }

    return { company, admin };
  });
}

export async function listActiveCompaniesForRegistration() {
  return prisma.company.findMany({
    where: { status: { in: ["ACTIVE", "TRIAL"] } },
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });
}
