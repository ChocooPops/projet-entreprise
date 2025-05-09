-- AlterTable
ALTER TABLE `project` MODIFY `description` VARCHAR(5000) NULL DEFAULT 'Le projet consiste en ...';

-- AlterTable
ALTER TABLE `task` MODIFY `title` VARCHAR(191) NOT NULL DEFAULT 'Tâche sans titre',
    MODIFY `description` VARCHAR(1000) NULL DEFAULT 'Vide';
