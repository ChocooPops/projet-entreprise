import { Injectable } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {

  constructor(private prismaService: PrismaService) { }

  async createHollowNewProject(): Promise<Project> {
    return await this.prismaService.project.create({
      data: {
        name: 'Projet sans nom'
      }
    })
  }

  async getAllProjectByUser(userId: string): Promise<Project[]> {
    const user: User = await this.prismaService.user.findUnique({
      where: { id: userId }
    });
    if (user) {
      if (user.role === 'DIRECTOR') {
        return await this.prismaService.project.findMany();
      } else {
        return this.prismaService.project.findMany({
          where: {
            assignedUsers: {
              some: {
                id: userId,
              },
            },
          },
        });
      }
    } else {
      return [];
    }

  }

  async deleteProjectById(id: string): Promise<void> {
    await this.prismaService.project.delete({
      where: { id: id }
    })
  }



}
