/*
  Warnings:

  - You are about to drop the column `role` on the `message` table. All the data in the column will be lost.
  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `role`,
    ADD COLUMN `type` ENUM('USER', 'AI') NOT NULL;
