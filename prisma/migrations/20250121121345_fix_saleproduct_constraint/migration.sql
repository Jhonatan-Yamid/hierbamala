/*
  Warnings:

  - A unique constraint covering the columns `[saleId,productId]` on the table `SaleProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
-- DROP INDEX `SaleProduct_saleId_productId_observation_key` ON `SaleProduct`;

-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `generalObservation` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SaleProduct_saleId_productId_key` ON `SaleProduct`(`saleId`, `productId`);
