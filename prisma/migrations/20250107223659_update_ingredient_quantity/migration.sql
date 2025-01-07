/*
  Warnings:

  - You are about to alter the column `quantity` on the `Ingredient` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Ingredient` MODIFY `quantity` DOUBLE NULL;
