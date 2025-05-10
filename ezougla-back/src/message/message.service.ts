import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '@prisma/client';
import { Conversation } from '@prisma/client';
import { MessageType } from '@prisma/client';
import { CreateFileModel } from 'src/file/dto/create-file.interface';
import { UploadFileService } from 'src/common/services/upload-file.service';
import { MistralApiService } from 'src/common/services/msitral-api.service';

@Injectable()
export class MessageService {

  constructor(private prismaService: PrismaService,
    private uploadFileService: UploadFileService,
    private mistralApiService: MistralApiService
  ) { }

  async createEmptyConversation(projectId: string, authorId: string): Promise<Conversation> {
    return await this.prismaService.conversation.create({
      data: {
        title: 'Conversation sans nom',
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
        type: MessageType.TEXT_USER,
        conversationId,
        authorId,
      },
      include: {
        conversation: true,
        author: true,
        file: true
      },
    });
  }

  async sendMessageToMistralApi(conversationId: string, content: string, authorId: string): Promise<Message[]> {
    const messages: Message[] = [];

    const userMessage = await this.addMessageToConversationByUser(conversationId, content, authorId);
    messages.push(userMessage);

    try {
      const resMistral: any = await this.mistralApiService.fetchSendQuestion(content);
      const contentMistralMessage: string = resMistral.choices[0].message.content;
      const messageMistral: Message = await this.prismaService.message.create({
        data: {
          content: contentMistralMessage,
          type: MessageType.TEXT_AI_SUCCESS,
          conversationId,
          authorId,
        },
        include: {
          conversation: true,
          author: true,
          file: true,
        },
      });

      messages.push(messageMistral);
    } catch (error) {
      const errorMessage: Message = await this.prismaService.message.create({
        data: {
          content: 'Erreur Mistral API : ' + error,
          type: MessageType.TEXT_AI_ERROR,
          conversationId,
          authorId,
        },
        include: {
          conversation: true,
          author: true,
          file: true,
        },
      });

      messages.push(errorMessage);
    }
    return messages;
  }

  async addFileMessageIntoConversation(
    conversationId: string,
    files: CreateFileModel[],
    authorId: string
  ): Promise<Message[]> {
    const messages: Message[] = [];
    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
      select: { projectId: true },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    for (const file of files) {
      const url = await this.uploadFileService.saveFiletoFile(file.file, file.name);
      if (url) {
        const createdFile = await this.prismaService.file.create({
          data: {
            name: file.name,
            url: url,
            type: this.uploadFileService.getExtensionFromFilename(file.name),
            uploadedBy: {
              connect: { id: authorId },
            },
            project: {
              connect: { id: conversation.projectId },
            },
            conversationId: conversationId,
          },
        });
        const message = await this.prismaService.message.create({
          data: {
            content: '',
            type: MessageType.FILE,
            conversation: {
              connect: { id: conversationId },
            },
            author: {
              connect: { id: authorId },
            },
            file: {
              connect: { id: createdFile.id },
            },
          },
          include: {
            conversation: true,
            author: true,
            file: true,
          },
        });

        messages.push(message);
      }
    }
    return messages;
  }

  async getConversationsByProjectId(projectId: string): Promise<Conversation[]> {
    return await this.prismaService.conversation.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        author: true,
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
        file: true
      },
    });
  }

  async deleteConversation(conversationId: string): Promise<Conversation> {
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
