import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectService {

  constructor(private prismaService: PrismaService) { }

  async createHollowNewProject(role: Role): Promise<Project> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      return await this.prismaService.project.create({
        data: {
          name: 'Projet sans nom',
          description: 'Description ...'
        }
      })
    } else {
      new UnauthorizedException();
    }
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
          orderBy: {
            createdAt: 'asc',
          },
        });
      }
    } else {
      return [];
    }
  }

  async updateNameProjectById(idProject: string, newName: string, role: Role): Promise<Project> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      if (!newName || newName === '') {
        newName = "Sans nom";
      }
      return await this.prismaService.project.update({
        where: { id: idProject },
        data: { name: newName },
      });
    } else {
      new UnauthorizedException();
    }
  }

  async updateDescriptionProjectById(idProject: string, newDescribe: string, role: Role): Promise<Project> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      return await this.prismaService.project.update({
        where: { id: idProject },
        data: { description: newDescribe },
      });
    } else {
      new UnauthorizedException();
    }
  }

  async deleteProjectById(id: string, role: Role): Promise<void> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      await this.prismaService.task.deleteMany({
        where: { projectId: id },
      });
      await this.prismaService.conversation.deleteMany({
        where: { projectId: id },
      });
      await this.prismaService.file.deleteMany({
        where: { projectId: id },
      });
      await this.prismaService.project.delete({
        where: { id: id }
      })
    }
  }



}
