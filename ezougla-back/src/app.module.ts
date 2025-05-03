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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TaskModule, AuthModule, ProjectModule, UserModule, FileModule, ConversationModule, MessageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
