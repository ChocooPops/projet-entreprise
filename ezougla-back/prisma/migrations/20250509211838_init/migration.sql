/*
  Warnings:

  - The values [USER,AI] on the enum `Message_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_conversationId_fkey`;

-- DropIndex
DROP INDEX `File_conversationId_fkey` ON `file`;

-- AlterTable
ALTER TABLE `file` ADD COLUMN `messageId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `message` MODIFY `content` VARCHAR(2000) NOT NULL,
    MODIFY `type` ENUM('TEXT_USER', 'TEXT_AI', 'FILE') NOT NULL;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
