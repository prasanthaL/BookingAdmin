/*
  Warnings:

  - A unique constraint covering the columns `[dodoCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dodoSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "BillingProvider" ADD VALUE 'DODO_PAYMENTS';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "dodoCustomerId" TEXT,
ADD COLUMN     "dodoSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_dodoCustomerId_key" ON "Subscription"("dodoCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_dodoSubscriptionId_key" ON "Subscription"("dodoSubscriptionId");
