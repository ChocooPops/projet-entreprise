import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Conversation } from 'generated/prisma';
import { Message } from 'generated/prisma';

@Injectable()
export class MessageService {

  constructor(private prismaService: PrismaService) { }

  async createEmptyConversation(title: string, projectId: string, authorId: string): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.create({
      data: {
        title,
        projectId,
        authorId,
      },
      include: {
        author: true,
        project: true,
      },
    });

    return conversation;
  }

  async addMessageToConversation(conversationId: string, content: string, role: 'user' | 'ai', authorId: string): Promise<Message> {
    const message = await this.prismaService.message.create({
      data: {
        content,
        role,
        conversationId,
        authorId,
      },
      include: {
        conversation: true,
        author: true,
      },
    });

    return message;
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

}
