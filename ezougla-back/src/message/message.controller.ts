import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUser } from 'src/auth/current-user.guard';
import { CreateFileModel } from 'src/file/dto/create-file.interface';
import { MessageType } from '@prisma/client';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Get('get-all-messages-by-conversation/:conversationId')
  async getAllMessagesByConversationId(@Param('conversationId') conversationId: string) {
    return this.messageService.getMessagesByConversation(conversationId);
  }

  @Get('get-all-conversation-by-project/:projectId')
  async getAllConversationByProjectId(@Param('projectId') projectId: string) {
    return this.messageService.getConversationsByProjectId(projectId);
  }

  @Post('create-empty-conversation/:projectId')
  async createNewEmptyConversattion(@CurrentUser('sub') userId: string, @Param('projectId') projectId: string) {
    return await this.messageService.createEmptyConversation(projectId, userId);
  }

  @Put('update-name/:conversationId')
  async updateNameConversation(@Param('conversationId') conversationId, @Body('title') title) {
    return await this.messageService.updateConversationTitle(conversationId, title);
  }

  @Post('add-message/:conversationId')
  async addMessageIntoConversation(@CurrentUser('sub') userId: string, @Param('conversationId') conversationId, @Body('content') content) {
    return await this.messageService.addMessageToConversationByUser(conversationId, content, userId, MessageType.TEXT_USER_TO_USER);
  }

  @Post('send-message-to-mistral/:conversationId')
  async saveResponseMistralApi(@CurrentUser('sub') userId: string, @Param('conversationId') conversationId, @Body('content') content, @Body('files') files: CreateFileModel[]) {
    return await this.messageService.sendMessageToMistralApi(conversationId, content, userId, files);
  }

  @Post('analyse-conversation-by-mistral/:conversationId')
  async analyseAllConversationByIdFromMistral(@CurrentUser('sub') userId: string, @Param('conversationId') conversationId, @Body('content') content, @Body('files') files: CreateFileModel[]) {
    return await this.messageService.analyseAllConversationByIdFromMistral(conversationId, content, userId, files);
  }

  @Post('add-file/:conversationId')
  async addFileMessageIntoConversation(@CurrentUser('sub') userId: string, @Param('conversationId') conversationId, @Body('files') files: CreateFileModel[]) {
    return await this.messageService.addFileMessageIntoConversation(conversationId, files, userId);
  }

  @Delete(':conversationId')
  async deleteConversationById(@Param('conversationId') conversationId: string) {
    return await this.messageService.deleteConversation(conversationId);
  }

}
