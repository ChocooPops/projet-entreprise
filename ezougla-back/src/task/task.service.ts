import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {

  constructor(private prismaService: PrismaService) { }

  async getTaskByProjectId(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.prismaService.task.findMany({
        where: {
          projectId: projectId,
        },
      });
      return tasks;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers du projet :', error);
      return [];
    }
  }

}
