import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '@prisma/client';
import { Conversation } from '@prisma/client';
import { MessageType } from '@prisma/client';

@Injectable()
export class MessageService {

  constructor(private prismaService: PrismaService) { }

  async createEmptyConversation(projectId: string, authorId: string): Promise<Conversation> {
    return await this.prismaService.conversation.create({
      data: {
        title : 'Conversation sans nom',
        projectId,
        authorId,
      },
      include: {
        author: true,
        project: true,
      },
    });
  }

  async updateConversationTitle(conversationId: string, newTitle: string): Promise<Conversation> {
      return await this.prismaService.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          title: newTitle,
        },
      });
  }

  async addMessageToConversationByUser(conversationId: string, content: string, authorId: string): Promise<Message> {
    return await this.prismaService.message.create({
      data: {
        content,
        type : MessageType.USER,
        conversationId,
        authorId,
      },
      include: {
        conversation: true,
        author: true,
      },
    });
  }

  async getConversationsByProjectId(projectId: string) : Promise<Conversation[]> {
      return await this.prismaService.conversation.findMany({
        where: {
          projectId: projectId,
        },
        include: {
          author: true,
          messages: true,
          files: true,
        },
      });
  }
  
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await this.prismaService.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: true,
      },
    });
  }

  async deleteConversation(conversationId: string) : Promise<Conversation>{
    try {
      await this.prismaService.message.deleteMany({
        where: {
          conversationId,
        },
      });
      return await this.prismaService.conversation.delete({
        where: {
          id: conversationId,
        },
      });
  
    } catch (error) {
      throw new UnprocessableEntityException();
    }
  }

}
