import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadFileService } from 'src/common/services/upload-file.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, UploadFileService],
})
export class ProjectModule { }
