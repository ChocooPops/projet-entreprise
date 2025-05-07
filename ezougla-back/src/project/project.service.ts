import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { UploadFileService } from 'src/common/services/upload-file.service';
import { CreateFileModel } from 'src/file/dto/create-file.interface';

@Injectable()
export class ProjectService {

  constructor(private prismaService: PrismaService, 
    private uploadFileService : UploadFileService
  ) { }

  async createHollowNewProject(role: Role): Promise<Project> {
    if (role === 'DIRECTOR' || role === 'MANAGER') {
      return await this.prismaService.project.create({
        data: {
          name: 'Projet sans nom',
          description: 'Description ...'
        }
      })
    } else {
      throw new UnauthorizedException();
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

  async updateBackgroundImagePersonalize(role : Role, file : CreateFileModel) : Promise<any> {
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

}
