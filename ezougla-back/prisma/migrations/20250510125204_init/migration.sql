/*
  Warnings:

  - The values [TEXT_AI] on the enum `Message_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `type` ENUM('TEXT_USER', 'TEXT_AI_SUCCESS', 'TEXT_AI_ERROR', 'FILE') NOT NULL;
