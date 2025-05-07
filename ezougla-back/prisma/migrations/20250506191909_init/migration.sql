-- AlterTable
ALTER TABLE `project` MODIFY `description` VARCHAR(1000) NULL DEFAULT 'Le projet consiste en ...',
    MODIFY `srcBackground` VARCHAR(191) NOT NULL DEFAULT 'uploads/projects/back-1.jpg';

-- AlterTable
ALTER TABLE `user` MODIFY `profilePhoto` VARCHAR(191) NOT NULL DEFAULT 'uploads/user/user-1.jpg';
