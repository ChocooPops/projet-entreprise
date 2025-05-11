import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUser } from './dto/create-user.interface';
import { MessageModel } from 'src/common/model/message.interface';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateFileModel } from 'src/file/dto/create-file.interface';
import { UploadFileService } from 'src/common/services/upload-file.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService,
    private uploadFileService: UploadFileService
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async registerUser(userRegister: RegisterUser): Promise<MessageModel> {
    let message: MessageModel = { message: '' };
    const user: User = await this.prisma.user.findUnique({
      where: {
        email: userRegister.email
      }
    })
    if (user) {
      if (user.role === 'NOT_ACTIVATE') {
        message.message = 'Votre demande de connection est en attente de validation'
      } else {
        message.message = "Cette identifiant existe deja";
      }
    } else {
      const hashedPassword = await bcrypt.hash(userRegister.password, 10);
      const newUser: User = await this.prisma.user.create({
        data: {
          firstName: userRegister.firstName,
          lastName: userRegister.lastName,
          email: userRegister.email,
          password: hashedPassword,
          role: 'NOT_ACTIVATE'
        }
      });
      message.message = "Votre de demande d'inscription a été envoyé, vous recevrez prochainement un email de validation"
    }
    return message;
  }

  async findUserById(id: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { id: id } })
  }

  async changeProfilPhoto(id: string, newUrl: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { profilePhoto: newUrl },
    });
  }

  async createNewProfilPhoto(file: CreateFileModel, idUser: string): Promise<User> {
    if (file.file) {
      const url = await this.uploadFileService.saveFileToUser(file.file, file.name);
      if (url) {
        return await this.prisma.user.update({
          where: { id: idUser },
          data: { profilePhoto: url },
        });
      }
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async modifyRoleUser(roleAdmin: Role, idUser: string, newRole: Role): Promise<User> {
    if (roleAdmin === 'DIRECTOR') {
      return await this.prisma.user.update({
        where: { id: idUser },
        data: { role: newRole }
      })
    } else {
      throw new UnauthorizedException();
    }
  }

  async enableUser(roleAdmin: Role, idUser: string): Promise<User> {
    if (roleAdmin === 'DIRECTOR') {
      return await this.prisma.user.update({
        where: { id: idUser },
        data: { role: 'EMPLOYEE' }
      })
    } else {
      throw new UnauthorizedException();
    }
  }

  async disableUser(roleAdmin: Role, idUser: string): Promise<User> {
    if (roleAdmin === 'DIRECTOR') {
      return await this.prisma.user.update({
        where: { id: idUser },
        data: { role: 'NOT_ACTIVATE' }
      })
    } else {
      throw new UnauthorizedException();
    }
  }

  async deleteUserById(roleAdmin: Role, idUser: string): Promise<User> {
    if (roleAdmin === 'DIRECTOR') {
      return await this.prisma.user.delete({
        where: { id: idUser }
      })
    } else {
      throw new UnauthorizedException();
    }
  }


}
