import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { isValidSaudiPhone, normalizePhone } from "../lib/validations/phone";

const prisma = new PrismaClient();

const DEFAULT_COMPANY_ID = "default-company";

const products = [
  { name: "قارورة 20 لتر", sizeLiters: 20, price: 5 },
  { name: "قارورة 10 لتر", sizeLiters: 10, price: 3 },
];

async function ensureDefaultCompany() {
  await prisma.company.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      id: DEFAULT_COMPANY_ID,
      name: "شركة مياهي الافتراضية",
      slug: "default",
      status: "ACTIVE",
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
}

async function seedProducts(companyId: string) {
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { companyId, name: product.name, sizeLiters: product.sizeLiters },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { price: product.price },
      });
      continue;
    }

    await prisma.product.create({
      data: { companyId, ...product },
    });
  }
}

async function seedAdminFromEnv(companyId: string) {
  const phone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "مدير النظام";

  if (!phone || !password) {
    console.log("Skipping admin seed (set ADMIN_PHONE and ADMIN_PASSWORD to create an admin)");
    return;
  }

  const normalizedPhone = normalizePhone(phone);
  if (!isValidSaudiPhone(normalizedPhone)) {
    throw new Error("ADMIN_PHONE must be a valid Saudi mobile number (05XXXXXXXX)");
  }

  if (password.length < 6) {
    throw new Error("ADMIN_PASSWORD must be at least 6 characters");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN", companyId },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping admin seed");
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      companyId,
      phone: normalizedPhone,
      passwordHash,
      name,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created for phone ${normalizedPhone}`);
}

async function seedSuperAdminFromEnv() {
  const phone = process.env.SUPER_ADMIN_PHONE?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "مدير المنصة";

  if (!phone || !password) {
    console.log(
      "Skipping super admin seed (set SUPER_ADMIN_PHONE and SUPER_ADMIN_PASSWORD)",
    );
    return;
  }

  const normalizedPhone = normalizePhone(phone);
  if (!isValidSaudiPhone(normalizedPhone)) {
    throw new Error("SUPER_ADMIN_PHONE must be a valid Saudi mobile number (05XXXXXXXX)");
  }

  const existing = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN", phone: normalizedPhone },
  });

  if (existing) {
    console.log("Super admin already exists, skipping");
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      phone: normalizedPhone,
      passwordHash,
      name,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Super admin created for phone ${normalizedPhone}`);
}

async function main() {
  await ensureDefaultCompany();
  await seedProducts(DEFAULT_COMPANY_ID);
  await seedAdminFromEnv(DEFAULT_COMPANY_ID);
  await seedSuperAdminFromEnv();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
