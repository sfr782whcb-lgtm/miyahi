-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#059669',
    "status" "CompanyStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- Default tenant for existing data
INSERT INTO "Company" (
    "id",
    "name",
    "slug",
    "status",
    "trialEndsAt",
    "updatedAt"
) VALUES (
    'default-company',
    'شركة مياهي الافتراضية',
    'default',
    'ACTIVE',
    NOW() + INTERVAL '365 days',
    CURRENT_TIMESTAMP
);

-- Add tenant columns
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Customer" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Driver" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Product" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Order" ADD COLUMN "companyId" TEXT;

-- Backfill existing rows
UPDATE "User" SET "companyId" = 'default-company' WHERE "role" <> 'SUPER_ADMIN';
UPDATE "Customer" SET "companyId" = 'default-company';
UPDATE "Driver" SET "companyId" = 'default-company';
UPDATE "Product" SET "companyId" = 'default-company';
UPDATE "Order" SET "companyId" = 'default-company';

-- Enforce tenant ownership (User.companyId stays nullable for SUPER_ADMIN)
ALTER TABLE "Customer" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Driver" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "companyId" SET NOT NULL;

-- Drop old global unique constraints
DROP INDEX IF EXISTS "User_phone_key";
DROP INDEX IF EXISTS "Customer_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE INDEX "Company_status_idx" ON "Company"("status");

CREATE UNIQUE INDEX "User_companyId_phone_key" ON "User"("companyId", "phone");
CREATE INDEX "User_companyId_idx" ON "User"("companyId");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE UNIQUE INDEX "Customer_companyId_phone_key" ON "Customer"("companyId", "phone");
CREATE INDEX "Customer_companyId_idx" ON "Customer"("companyId");

CREATE INDEX "Driver_companyId_idx" ON "Driver"("companyId");
CREATE INDEX "Driver_companyId_status_idx" ON "Driver"("companyId", "status");

CREATE UNIQUE INDEX "Product_companyId_name_sizeLiters_key" ON "Product"("companyId", "name", "sizeLiters");
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");
CREATE INDEX "Product_companyId_isActive_idx" ON "Product"("companyId", "isActive");

CREATE INDEX "Order_companyId_idx" ON "Order"("companyId");
CREATE INDEX "Order_companyId_status_idx" ON "Order"("companyId", "status");
CREATE INDEX "Order_companyId_createdAt_idx" ON "Order"("companyId", "createdAt");
CREATE INDEX "Order_companyId_driverId_idx" ON "Order"("companyId", "driverId");
CREATE INDEX "Order_companyId_customerId_idx" ON "Order"("companyId", "customerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
