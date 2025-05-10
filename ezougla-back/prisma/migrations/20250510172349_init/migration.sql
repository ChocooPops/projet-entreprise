/*
  Warnings:

  - You are about to drop the `deepresearchlog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `deepresearchlog` DROP FOREIGN KEY `DeepResearchLog_userId_fkey`;

-- DropTable
DROP TABLE `deepresearchlog`;
