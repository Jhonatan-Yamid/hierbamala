/*
  Warnings:

  - The primary key for the `SaleProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[saleId,productId,observation]` on the table `SaleProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `SaleProduct` DROP FOREIGN KEY `SaleProduct_saleId_fkey`;

-- DropIndex
DROP INDEX `SaleProduct_saleId_productId_key` ON `SaleProduct`;

-- AlterTable
ALTER TABLE `SaleProduct` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `SaleProduct_saleId_productId_observation_key` ON `SaleProduct`(`saleId`, `productId`, `observation`);

-- AddForeignKey
ALTER TABLE `SaleProduct` ADD CONSTRAINT `SaleProduct_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
