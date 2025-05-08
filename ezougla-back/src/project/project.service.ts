import { Injectable, UnauthorizedException, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { UploadFileService } from 'src/common/services/upload-file.service';
import { CreateFileModel } from 'src/file/dto/create-file.interface';

@Injectable()
export class ProjectService {

  constructor(private prismaService: PrismaService,
    private uploadFileService: UploadFileService
  ) { }

  async createHollowNewProject(role: Role, userId: string): Promise<Project> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      return await this.prismaService.project.create({
        data: {
          name: 'Projet sans nom',
          description: 'Description ...',
          assignedUsers: {
            connect: { id: userId },
          },
        },
        include: {
          assignedUsers: true,
        },
      });
    } else {
      throw new UnauthorizedException();
    }
  }

  async getAllProjectByUser(userId: string): Promise<Project[]> {
    const user: User | null = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return [];
    }

    if (user.role === 'DIRECTOR') {
      return await this.prismaService.project.findMany({
        include: {
          assignedUsers: true,
        },
      });
    }

    return await this.prismaService.project.findMany({
      where: {
        assignedUsers: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        assignedUsers: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
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
      throw new UnauthorizedException();
    }
  }

  async updateDescriptionProjectById(idProject: string, newDescribe: string, role: Role): Promise<Project> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      return await this.prismaService.project.update({
        where: { id: idProject },
        data: { description: newDescribe },
      });
    } else {
      throw new UnauthorizedException();
    }
  }

  async deleteProjectById(id: string, role: Role): Promise<any> {
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
      return await this.prismaService.project.delete({
        where: { id: id }
      })
    } else {
      throw new UnauthorizedException();
    }
  }


  async updateBackgroundImage(id: string, role: Role, url: string): Promise<any> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      return await this.prismaService.project.update({
        where: { id: id },
        data: { srcBackground: url }
      })
    } else {
      throw new UnauthorizedException();
    }
  }

  async updateBackgroundImagePersonalize(role: Role, file: CreateFileModel): Promise<any> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      const url = await this.uploadFileService.saveFileToProjects(file.file, file.name);
      return await this.prismaService.project.update({
        where: { id: file.idProjects },
        data: { srcBackground: url }
      })
    } else {
      throw new UnauthorizedException();
    }
  }

  async addUserToProject(roleAdmin: Role, userId: string, projectId: string): Promise<Project> {
    if (roleAdmin === 'DIRECTOR' || roleAdmin === 'MANAGER') {
      const [user, project] = await Promise.all([
        this.prismaService.user.findUnique({ where: { id: userId } }),
        this.prismaService.project.findUnique({ where: { id: projectId } }),
      ]);

      if (!user || !project) {
        throw new NotFoundException('Utilisateur ou projet introuvable');
      }

      if (user.role === 'NOT_ACTIVATE') {
        throw new NotAcceptableException()
      }

      return await this.prismaService.project.update({
        where: { id: projectId },
        data: {
          assignedUsers: {
            connect: { id: userId },
          },
        },
        include: {
          assignedUsers: true,
        },
      });
    } else {
      throw new UnauthorizedException();
    }
  }

  async removeUserToProject(roleAdmin: Role, userId: string, projectId: string): Promise<Project> {
    if (roleAdmin !== 'DIRECTOR' && roleAdmin !== 'MANAGER') {
      throw new UnauthorizedException();
    }

    const [user, project] = await Promise.all([
      this.prismaService.user.findUnique({ where: { id: userId } }),
      this.prismaService.project.findUnique({ where: { id: projectId } }),
    ]);

    if (!user || !project) {
      throw new NotFoundException('Utilisateur ou projet introuvable');
    }

    if (user.role === 'NOT_ACTIVATE') {
      throw new NotAcceptableException();
    }
    const projectTasks = await this.prismaService.task.findMany({
      where: { projectId },
      select: { id: true },
    });

    const updateTasks = projectTasks.map(task =>
      this.prismaService.task.update({
        where: { id: task.id },
        data: {
          assignedUsers: {
            disconnect: { id: userId },
          },
        },
      }),
    );

    await Promise.all(updateTasks);
    return await this.prismaService.project.update({
      where: { id: projectId },
      data: {
        assignedUsers: {
          disconnect: { id: userId },
        },
      },
      include: {
        assignedUsers: true,
      },
    });
  }


}
