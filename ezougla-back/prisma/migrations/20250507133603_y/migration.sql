/*
  Warnings:

  - The values [NOT_VALIDATE] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('DIRECTOR', 'MANAGER', 'EMPLOYEE', 'NOT_ACTIVATE') NOT NULL;
