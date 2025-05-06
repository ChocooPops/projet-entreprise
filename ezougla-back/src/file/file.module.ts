import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadFileService } from 'src/common/services/upload-file.service';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService, UploadFileService],
})
export class FileModule { }
