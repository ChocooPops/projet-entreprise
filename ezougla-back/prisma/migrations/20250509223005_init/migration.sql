/*
  Warnings:

  - You are about to drop the column `messageId` on the `file` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_messageId_fkey`;

-- DropIndex
DROP INDEX `File_messageId_fkey` ON `file`;

-- AlterTable
ALTER TABLE `file` DROP COLUMN `messageId`;

-- AlterTable
ALTER TABLE `message` ADD COLUMN `fileId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Message_fileId_key` ON `Message`(`fileId`);

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
