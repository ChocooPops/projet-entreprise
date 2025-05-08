import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from '@prisma/client';
import { TaskStatus } from '@prisma/client';
import { User } from '@prisma/client';

@Injectable()
export class TaskService {

  constructor(private prismaService: PrismaService) { }

  async getTaskByProjectId(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.prismaService.task.findMany({
        where: {
          projectId: projectId,
        },
        include: {
          assignedUsers: true,
        },
      });
      return tasks;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers du projet :', error);
      return [];
    }
  }

  async createEmptyTask(projectId: string, userId: string): Promise<Task> {
    return this.prismaService.task.create({
      data: {
        title: 'Tâche sans titre',
        description: 'vide',
        status: TaskStatus.TODO,
        project: {
          connect: { id: projectId },
        },
        User: {
          connect: { id: userId },
        },
      },
      include: { assignedUsers: true, project: true },
    });
  }

  async updateTaskTitle(taskId: string, newTitle: string): Promise<Task> {
    return this.prismaService.task.update({
      where: { id: taskId },
      data: { title: newTitle },
    });
  }

  async updateTaskDescription(taskId: string, newDescription: string): Promise<Task> {
    return this.prismaService.task.update({
      where: { id: taskId },
      data: { description: newDescription },
    });
  }

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    return this.prismaService.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });
  }

  async addUserToTask(taskId: string, userId: string): Promise<Task> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { assignedProjects: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Tâche introuvable');
    }

    const isAssignedToProject = user.assignedProjects.some(
      (project) => project.id === task.project.id
    );

    if (!isAssignedToProject) {
      throw new UnauthorizedException("L'utilisateur n'appartient pas au projet de la tâche");
    }

    return this.prismaService.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          connect: { id: userId },
        },
      },
      include: { assignedUsers: true },
    });
  }


  async removeUserFromTask(taskId: string, userId: string): Promise<Task> {
    const user: User = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur ou projet introuvable');
    }
    return this.prismaService.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          disconnect: { id: userId },
        },
      },
      include: { assignedUsers: true },
    });
  }

  async deleteTask(taskId: string): Promise<Task> {
    return this.prismaService.task.delete({
      where: { id: taskId },
    });
  }

}
