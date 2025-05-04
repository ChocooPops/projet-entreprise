import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUser } from './dto/create-user.interface';
import { MessageModel } from 'src/common/model/message.interface';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService) { }

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
      if (user.role === 'NOT_VALIDATE') {
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
          role: 'NOT_VALIDATE'
        }
      });
      message.message = "Votre de demande d'inscription a été envoyé, vous recevrez prochainement un email de validation"
    }
    return message;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
