import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadFileService } from 'src/common/services/upload-file.service';
import { HttpModule } from '@nestjs/axios';
import { MistralApiService } from 'src/common/services/msitral-api.service';

@Module({
  imports: [HttpModule],
  controllers: [MessageController],
  providers: [MessageService, PrismaService, UploadFileService, MistralApiService],
})
export class MessageModule { }
