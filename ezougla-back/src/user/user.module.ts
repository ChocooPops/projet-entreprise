import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadFileService } from 'src/common/services/upload-file.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, UploadFileService],
})
export class UserModule { }
