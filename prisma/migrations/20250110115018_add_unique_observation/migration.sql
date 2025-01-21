/*
  Warnings:

  - A unique constraint covering the columns `[saleId,productId,observation]` on the table `SaleProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SaleProduct_saleId_productId_observation_key` ON `SaleProduct`(`saleId`, `productId`, `observation`);
