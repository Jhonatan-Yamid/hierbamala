-- AlterTable
ALTER TABLE `Sale` MODIFY `table` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SaleProduct` ADD COLUMN `observation` VARCHAR(191) NULL;
