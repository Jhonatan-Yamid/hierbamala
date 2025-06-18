-- CreateTable
CREATE TABLE `SaleProductAddition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleProductId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,

    INDEX `SaleProductAddition_saleProductId_idx`(`saleProductId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SaleProductAddition` ADD CONSTRAINT `SaleProductAddition_saleProductId_fkey` FOREIGN KEY (`saleProductId`) REFERENCES `SaleProduct`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
