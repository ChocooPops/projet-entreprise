import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '@prisma/client';
import { Conversation } from '@prisma/client';
import { MessageType } from '@prisma/client';
import { CreateFileModel } from 'src/file/dto/create-file.interface';
import { UploadFileService } from 'src/common/services/upload-file.service';
import { MistralApiService } from 'src/common/services/msitral-api.service';
import * as fs from 'fs';
import * as path from 'path';

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

  async addMessageToConversationByUser(conversationId: string, content: string, authorId: string, typeMessage: MessageType): Promise<Message> {
    return await this.prismaService.message.create({
      data: {
        content,
        type: typeMessage,
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

  async sendMessageToMistralApi(conversationId: string, content: string, authorId: string, files: CreateFileModel[]): Promise<Message[]> {
    const messages: Message[] = [];
    if ((content && content !== '') || (files && files.length > 0)) {

      if (content && content !== '') {
        const userMessage: Message = await this.addMessageToConversationByUser(conversationId, content, authorId, MessageType.TEXT_USER_TO_AI);
        messages.push(userMessage);
      }
      const filesMessages: Message[] = await this.addFileMessageIntoConversation(conversationId, files, authorId);
      filesMessages.forEach((fileMessage: Message) => {
        messages.push(fileMessage);
      })

      try {
        let extractTextFromFiles: string = '';
        if (content && content !== '') {
          extractTextFromFiles = `${content} : `;
        } else {
          extractTextFromFiles = 'Analyse mes fichiers : ';
        }
        for (const file of files) {
          const textFromFile: string = await this.uploadFileService.extractAllTextFromBase64(file.name, file.file, true);
          extractTextFromFiles += `Mon fichier ${file.name} : ${textFromFile} \n `;
        }

        let resMistral !: any;
        if (files.length > 0) {
          resMistral = await this.mistralApiService.fetchSendQuestion(extractTextFromFiles);
        } else {
          resMistral = await this.mistralApiService.fetchSendQuestion(content);
        }
        const contentMistralMessage: string = resMistral.choices[0].message.content;
        const messageMistral: Message = await this.prismaService.message.create({
          data: {
            content: contentMistralMessage,
            type: MessageType.TEXT_AI_SIMPLE_ANSWER,
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
    }

    return messages;
  }

  async addFileMessageIntoConversation(conversationId: string, files: CreateFileModel[], authorId: string): Promise<Message[]> {
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

  async analyseAllConversationByIdFromMistral(conversationId: string, content: string, authorId: string, files: CreateFileModel[]): Promise<Message[]> {
    const messageReturned: Message[] = [];
    const conversation: Conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId
      }
    })
    const messages: any[] = await this.getMessagesByConversation(conversationId);

    if ((content && content !== '') || (files && files.length > 0)) {
      if (conversation) {
        if (content && content !== '') {
          const userMessage: Message = await this.addMessageToConversationByUser(conversationId, content, authorId, MessageType.ASK_ANALYSE_CONV);
          messageReturned.push(userMessage);
        }
        const filesMessages: Message[] = await this.addFileMessageIntoConversation(conversationId, files, authorId);
        filesMessages.forEach((fileMessage: Message) => {
          messageReturned.push(fileMessage);
        })

        try {
          if (messages && messages.length > 0) {
            let allMessages: string = '';
            if (content && content !== '') {
              allMessages = `${content} : \n `;
            } else {
              allMessages = 'Analyse ma conversation : \n ';
            }

            for (const message of messages) {
              let extractContentMessage: string = '';
              if (message.type === 'TEXT_AI_SIMPLE_ANSWER' || message.type === 'TEXT_AI_ANALYSIS_CONV') {
                extractContentMessage = 'MISTRAL : ';
              } else if (message.author) {
                extractContentMessage = message.author.firstName + ' ' + message.author.lastName + ' : ';
              } else {
                extractContentMessage = 'UTILISATEUR : ';
              }

              if (message.content && message.content != '') {
                extractContentMessage += message.content;
              }
              if (message.file) {
                const fileName = path.basename(message.file.url);
                if (fileName) {
                  const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'file', fileName);
                  if (fs.existsSync(filePath)) {
                    const fileBuffer = fs.readFileSync(filePath);
                    const base64 = fileBuffer.toString('base64');
                    const textFromFile: string = await this.uploadFileService.extractAllTextFromBase64(fileName, base64, false);
                    extractContentMessage += `Fichier ${fileName} => ${textFromFile} `
                  }
                }
              }
              allMessages += extractContentMessage + ' \n ';
            }
            if (files.length > 0) {
              allMessages += "Voici d'autre fichier pour compléter la conversation";
            }
            for (const file of files) {
              const textFromFile: string = await this.uploadFileService.extractAllTextFromBase64(file.name, file.file, false);
              if (textFromFile !== '') {
                allMessages += `Mon fichier ${file.name} : ${textFromFile} \n `;
              }
            }
            const resMistral: any = await this.mistralApiService.fetchSendQuestion(allMessages);
            const contentMistralMessage: string = resMistral.choices[0].message.content;
            const messageMistral: Message = await this.prismaService.message.create({
              data: {
                content: contentMistralMessage,
                type: MessageType.TEXT_AI_ANALYSIS_CONV,
                conversationId,
                authorId,
              },
              include: {
                conversation: true,
                author: true,
                file: true,
              },
            });
            messageReturned.push(messageMistral);
          } else {
            throw new UnprocessableEntityException('La conversation est vide');
          }

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
          messageReturned.push(errorMessage);
        }
      } else {
        throw new NotFoundException();
      }
    }
    return messageReturned;
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