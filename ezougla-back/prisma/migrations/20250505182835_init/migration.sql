-- AlterTable
ALTER TABLE `project` ADD COLUMN `srcBackground` VARCHAR(191) NOT NULL DEFAULT 'uploads/projects/neutre.jpg';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `profilePhoto` VARCHAR(191) NOT NULL DEFAULT 'uploads/user/neutre.jpg';
