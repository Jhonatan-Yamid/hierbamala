/*
  Warnings:

  - Added the required column `status` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `table` INTEGER NOT NULL;
