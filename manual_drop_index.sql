-- DropIndex
DROP INDEX `SaleProduct_saleId_productId_observation_key` ON `SaleProduct`;

-- AlterTable
ALTER TABLE `SaleProduct` MODIFY `observation` VARCHAR(191) NULL;

