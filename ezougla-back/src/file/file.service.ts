import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { File } from '@prisma/client';

@Injectable()
export class FileService {

  constructor(private prismaService: PrismaService) { }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }

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

}
