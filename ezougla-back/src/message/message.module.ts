import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadFileService } from 'src/common/services/upload-file.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService, UploadFileService],
})
export class MessageModule { }
