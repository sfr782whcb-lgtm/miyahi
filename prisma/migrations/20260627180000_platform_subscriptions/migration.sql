-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "subscriptionPlan" "SubscriptionPlan",
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");
CREATE INDEX "Company_subscriptionPlan_idx" ON "Company"("subscriptionPlan");
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");
