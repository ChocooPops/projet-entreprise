import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { File } from '@prisma/client';
import { CreateFileModel } from './dto/create-file.interface';
import { UploadFileService } from 'src/common/services/upload-file.service';

@Injectable()
export class FileService {

  constructor(private prismaService: PrismaService,
    private uploadFileService: UploadFileService) { }

  async getFilesByProjectId(projectId: string): Promise<File[]> {
    try {
      const files = await this.prismaService.file.findMany({
        where: {
          projectId: projectId,
        },
      });
      return files;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers du projet :', error);
      return [];
    }
  }

  async createFileInProject(file: CreateFileModel, idUser: string): Promise<File> {
    if (file.file) {
      const url = await this.uploadFileService.saveFiletoFile(file.file, file.name);
      if (url) {
        return await this.prismaService.file.create({
          data: {
            name: file.name,
            url: url,
            type: this.uploadFileService.getExtensionFromFilename(file.name),
            uploadedById: idUser,
            projectId: file.idProjects
          }
        })
      }
    }
  }

  async deleteFile(idFile: string): Promise<File | null> {
    const file = await this.prismaService.file.findUnique({
      where: { id: idFile },
      include: { message: true },
    });

    if (!file) return null;

    const state = await this.uploadFileService.deleteFileOrFolder(file.url);
    if (!state) return null;

    if (file.message) {
      await this.prismaService.message.delete({
        where: { id: file.message.id },
      });
    }
    return await this.prismaService.file.delete({
      where: { id: idFile },
    });
  }

}
