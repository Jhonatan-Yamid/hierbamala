-- AlterTable
ALTER TABLE `Alert` ADD COLUMN `repeatDay` INTEGER NULL,
    ADD COLUMN `repeatWeekly` BOOLEAN NOT NULL DEFAULT false;
