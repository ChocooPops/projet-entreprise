import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UploadController } from './upload/upload.controller';
import { HttpModule } from '@nestjs/axios';
import { MistralApiService } from './common/services/msitral-api.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TaskModule, AuthModule, HttpModule, ProjectModule, UserModule, FileModule, ConversationModule, MessageModule],
  controllers: [AppController, UploadController],
  providers: [AppService, MistralApiService, PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
